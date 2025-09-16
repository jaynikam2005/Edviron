import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../../schemas/order-status.schema';
import {
  TransactionQueryDto,
  PaginatedTransactionResponseDto,
  TransactionStatusResponseDto,
} from '../../dto/transaction-query.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getAllTransactions(query: TransactionQueryDto): Promise<PaginatedTransactionResponseDto> {
    const { page = 1, limit = 10, sort = 'payment_time', order = 'desc', status, payment_mode, gateway_name } = query;
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = {};
    if (status) matchConditions['orderStatus.status'] = status;
    if (payment_mode) matchConditions['orderStatus.payment_mode'] = payment_mode;
    if (gateway_name) matchConditions['gateway_name'] = gateway_name;

    // Build sort object
    const sortObj: any = {};
    if (sort === 'payment_time') {
      sortObj['orderStatus.payment_time'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'order_amount') {
      sortObj['orderStatus.order_amount'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'transaction_amount') {
      sortObj['orderStatus.transaction_amount'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'status') {
      sortObj['orderStatus.status'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'school_id') {
      sortObj['school_id'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'custom_order_id') {
      sortObj['custom_order_id'] = order === 'asc' ? 1 : -1;
    } else {
      sortObj['createdAt'] = order === 'asc' ? 1 : -1;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus'
        }
      },
      {
        $unwind: {
          path: '$orderStatus',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {}
      },
      {
        $project: {
          _id: 1,
          order_id: '$_id',
          custom_order_id: 1,
          school_id: 1,
          trustee_id: 1,
          student_info: 1,
          gateway_name: 1,
          order_amount: '$orderStatus.order_amount',
          transaction_amount: '$orderStatus.transaction_amount',
          payment_mode: '$orderStatus.payment_mode',
          payment_details: '$orderStatus.payment_details',
          bank_reference: '$orderStatus.bank_reference',
          payment_message: '$orderStatus.payment_message',
          status: '$orderStatus.status',
          error_message: '$orderStatus.error_message',
          payment_time: '$orderStatus.payment_time',
          order_created_at: '$createdAt',
          status_updated_at: '$orderStatus.updatedAt'
        }
      },
      {
        $sort: sortObj
      }
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.orderModel.aggregate(countPipeline).exec();
    const totalItems = countResult.length > 0 ? countResult[0].total : 0;

    // Get paginated data
    const dataPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: limit as number }
    ];

    const transactions = await this.orderModel.aggregate(dataPipeline).exec();

    const totalPages = Math.ceil(totalItems / limit);

    this.logger.log(`Retrieved ${transactions.length} transactions (page ${page}/${totalPages})`);

    return {
      data: transactions,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      sort: {
        field: sort,
        order: order,
      },
    };
  }

  async getTransactionsBySchool(
    schoolId: string,
    query: TransactionQueryDto
  ): Promise<PaginatedTransactionResponseDto> {
    const { page = 1, limit = 10, sort = 'payment_time', order = 'desc', status, payment_mode } = query;
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = { school_id: schoolId };
    if (status) matchConditions['orderStatus.status'] = status;
    if (payment_mode) matchConditions['orderStatus.payment_mode'] = payment_mode;

    // Build sort object
    const sortObj: any = {};
    if (sort === 'payment_time') {
      sortObj['orderStatus.payment_time'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'order_amount') {
      sortObj['orderStatus.order_amount'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'transaction_amount') {
      sortObj['orderStatus.transaction_amount'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'status') {
      sortObj['orderStatus.status'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'custom_order_id') {
      sortObj['custom_order_id'] = order === 'asc' ? 1 : -1;
    } else {
      sortObj['createdAt'] = order === 'asc' ? 1 : -1;
    }

    const pipeline = [
      {
        $match: { school_id: schoolId }
      },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus'
        }
      },
      {
        $unwind: {
          path: '$orderStatus',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: matchConditions
      },
      {
        $project: {
          _id: 1,
          order_id: '$_id',
          custom_order_id: 1,
          school_id: 1,
          trustee_id: 1,
          student_info: 1,
          gateway_name: 1,
          order_amount: '$orderStatus.order_amount',
          transaction_amount: '$orderStatus.transaction_amount',
          payment_mode: '$orderStatus.payment_mode',
          payment_details: '$orderStatus.payment_details',
          bank_reference: '$orderStatus.bank_reference',
          payment_message: '$orderStatus.payment_message',
          status: '$orderStatus.status',
          error_message: '$orderStatus.error_message',
          payment_time: '$orderStatus.payment_time',
          order_created_at: '$createdAt',
          status_updated_at: '$orderStatus.updatedAt'
        }
      },
      {
        $sort: sortObj
      }
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.orderModel.aggregate(countPipeline).exec();
    const totalItems = countResult.length > 0 ? countResult[0].total : 0;

    // Get paginated data
    const dataPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: limit as number }
    ];

    const transactions = await this.orderModel.aggregate(dataPipeline).exec();

    const totalPages = Math.ceil(totalItems / limit);

    this.logger.log(`Retrieved ${transactions.length} transactions for school ${schoolId} (page ${page}/${totalPages})`);

    return {
      data: transactions,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      sort: {
        field: sort,
        order: order,
      },
    };
  }

  async getTransactionStatus(customOrderId: string): Promise<TransactionStatusResponseDto> {
    const pipeline = [
      {
        $match: { custom_order_id: customOrderId }
      },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus'
        }
      },
      {
        $unwind: {
          path: '$orderStatus',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          custom_order_id: 1,
          status: '$orderStatus.status',
          order_amount: '$orderStatus.order_amount',
          transaction_amount: '$orderStatus.transaction_amount',
          payment_mode: '$orderStatus.payment_mode',
          payment_time: '$orderStatus.payment_time',
          error_message: '$orderStatus.error_message',
          last_updated: '$orderStatus.updatedAt'
        }
      }
    ];

    const result = await this.orderModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      throw new NotFoundException(`Transaction with custom_order_id '${customOrderId}' not found`);
    }

    const transaction = result[0];

    this.logger.log(`Retrieved transaction status for order: ${customOrderId}`);

    return {
      custom_order_id: transaction.custom_order_id,
      status: transaction.status || 'pending',
      order_amount: transaction.order_amount,
      transaction_amount: transaction.transaction_amount,
      payment_mode: transaction.payment_mode,
      payment_time: transaction.payment_time,
      error_message: transaction.error_message,
      last_updated: transaction.last_updated || new Date(),
    };
  }
}