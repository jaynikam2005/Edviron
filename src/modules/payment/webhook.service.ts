import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../../schemas/order-status.schema';
import {
  WebhookLogs,
  WebhookLogsDocument,
} from '../../schemas/webhook-logs.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import {
  WebhookPayloadDto,
  WebhookResponseDto,
  OrderInfoDto,
} from '../../dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(OrderStatus.name)
    private readonly orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(WebhookLogs.name)
    private readonly webhookLogsModel: Model<WebhookLogsDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async processWebhook(
    payload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(
        `Processing webhook for order: ${this.safeString(payload.order_info?.order_id)}`,
      );

      // Log the webhook payload first
      await this.logWebhookPayload(payload, 'received');

      // Validate order_info exists
      if (!payload.order_info) {
        this.logger.warn('Webhook payload missing order_info');
        await this.logWebhookPayload(payload, 'invalid_payload');
        return {
          success: false,
          message: 'Invalid payload: missing order_info',
          processed_at: new Date(),
        };
      }

      // Find the order by order_id or custom_order_id
      const order = await this.findOrder(payload.order_info);

      if (!order) {
        this.logger.warn(
          `Order not found for webhook: ${JSON.stringify(payload.order_info)}`,
        );
        await this.logWebhookPayload(payload, 'order_not_found');

        return {
          success: false,
          message: 'Order not found',
          processed_at: new Date(),
        };
      }

      // Update or create OrderStatus record
      await this.updateOrderStatus(order, payload);

      // Log successful processing
      await this.logWebhookPayload(payload, 'processed');

      this.logger.log(
        `Webhook processed successfully for order: ${this.safeString(order._id)}`,
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        processed_at: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : this.safeString(error);
      this.logger.error('Error processing webhook:', errorMessage);

      // Log the error
      await this.logWebhookPayload(payload, 'error', errorMessage);

      return {
        success: false,
        message: 'Internal server error',
        processed_at: new Date(),
      };
    }
  }

  private safeString(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private async findOrder(
    orderInfo: OrderInfoDto,
  ): Promise<OrderDocument | null> {
    // Try to find by MongoDB _id first
    if (
      typeof orderInfo.order_id === 'string' &&
      /^[0-9a-fA-F]{24}$/.test(orderInfo.order_id)
    ) {
      const order = await this.orderModel.findById(orderInfo.order_id).exec();
      if (order) return order;
    }

    // Try to find by custom_order_id
    if (
      orderInfo.custom_order_id &&
      typeof orderInfo.custom_order_id === 'string'
    ) {
      const order = await this.orderModel
        .findOne({ custom_order_id: orderInfo.custom_order_id })
        .exec();
      if (order) return order;
    }

    // Try to find by order_id as custom_order_id
    if (orderInfo.order_id && typeof orderInfo.order_id === 'string') {
      const order = await this.orderModel
        .findOne({ custom_order_id: orderInfo.order_id })
        .exec();
      if (order) return order;
    }

    return null;
  }

  private async updateOrderStatus(
    order: OrderDocument,
    payload: WebhookPayloadDto,
  ): Promise<void> {
    const orderStatusData = {
      collect_id: new Types.ObjectId(order._id),
      order_amount: payload.order_info?.amount || 0,
      transaction_amount: payload.amount || payload.order_info?.amount || 0,
      payment_mode: payload.payment_method || 'unknown',
      payment_details: {
        transaction_id: payload.transaction_id,
        gateway_response: payload.gateway_response,
        metadata: (payload.metadata as Record<string, unknown>) || {},
      },
      status: this.mapWebhookStatusToOrderStatus(payload.status),
      payment_time: new Date(),
    };

    // Check if OrderStatus already exists for this order
    const existingOrderStatus = await this.orderStatusModel
      .findOne({ collect_id: order._id })
      .exec();

    if (existingOrderStatus) {
      // Update existing record
      await this.orderStatusModel
        .findByIdAndUpdate(
          existingOrderStatus._id,
          {
            ...orderStatusData,
            error_message:
              payload.status === 'failed'
                ? payload.gateway_response
                : undefined,
          },
          { new: true },
        )
        .exec();

      this.logger.log(
        `Updated existing OrderStatus: ${this.safeString(existingOrderStatus._id)}`,
      );
    } else {
      // Create new record
      const newOrderStatus = new this.orderStatusModel({
        ...orderStatusData,
        error_message:
          payload.status === 'failed' ? payload.gateway_response : undefined,
      });

      await newOrderStatus.save();
      this.logger.log(
        `Created new OrderStatus: ${this.safeString(newOrderStatus._id)}`,
      );
    }
  }

  private mapWebhookStatusToOrderStatus(webhookStatus: string): string {
    const statusMap: Record<string, string> = {
      success: 'success',
      completed: 'success',
      paid: 'success',
      failed: 'failed',
      error: 'failed',
      cancelled: 'cancelled',
      canceled: 'cancelled',
      pending: 'pending',
      processing: 'pending',
    };

    return statusMap[webhookStatus.toLowerCase()] || 'pending';
  }

  private async logWebhookPayload(
    payload: WebhookPayloadDto,
    processingStatus: string,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const webhookLog = new this.webhookLogsModel({
        raw_payload: payload,
        timestamp: new Date(),
        webhook_source: 'edviron_payment',
        event_type: `payment_${payload.status}`,
        processing_status: processingStatus,
        error_message: errorMessage,
      });

      await webhookLog.save();
      this.logger.debug(`Webhook logged with status: ${processingStatus}`);
    } catch (error) {
      this.logger.error('Failed to log webhook:', this.safeString(error));
      // Don't throw here to avoid breaking the main webhook processing
    }
  }

  async getWebhookLogs(limit: number = 50): Promise<WebhookLogs[]> {
    return this.webhookLogsModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getWebhookLogsByStatus(
    processingStatus: string,
  ): Promise<WebhookLogs[]> {
    return this.webhookLogsModel
      .find({ processing_status: processingStatus })
      .sort({ timestamp: -1 })
      .exec();
  }
}
