import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { CreatePaymentDto, PaymentResponseDto } from '../../dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    try {
      // Generate custom order ID
      const customOrderId = this.generateOrderId();

      // Create JWT payload
      const jwtPayload = {
        school_id: createPaymentDto.school_id,
        amount: createPaymentDto.amount,
        callback_url: createPaymentDto.callback_url,
        order_id: customOrderId,
        timestamp: Date.now(),
      };

      // Sign JWT with pg_key
      const pgKey = this.configService.get<string>('payment.pgKey');
      if (!pgKey) {
        throw new HttpException('Payment gateway key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const signedToken = jwt.sign(jwtPayload, pgKey, { expiresIn: '1h' });

      // Prepare API request
      const apiKey = this.configService.get<string>('payment.apiKey');
      const baseUrl = this.configService.get<string>('payment.baseUrl');

      if (!apiKey) {
        throw new HttpException('Payment API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const apiUrl = `${baseUrl}/erp/create-collect-request`;
      
      // Call Edviron Create Collect Request API
      const apiResponse = await axios.post(
        apiUrl,
        {
          signed_payload: signedToken,
          school_id: createPaymentDto.school_id,
          amount: createPaymentDto.amount,
          callback_url: createPaymentDto.callback_url,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      this.logger.log(`API Response Status: ${apiResponse.status}`);
      this.logger.log(`API Response Data: ${JSON.stringify(apiResponse.data)}`);

      // Create order in MongoDB
      const order = new this.orderModel({
        school_id: createPaymentDto.school_id,
        trustee_id: 'system', // Default trustee for API payments
        student_info: {
          name: 'API Payment',
          id: 'api_payment',
          email: 'payment@system.com',
        },
        gateway_name: 'edviron',
        custom_order_id: customOrderId,
      });

      const savedOrder = await order.save();
      this.logger.log(`Order saved with ID: ${savedOrder._id}`);

      // Extract payment link from API response
      const collectRequestUrl = apiResponse.data?.collect_request_url || 
                               apiResponse.data?.payment_link ||
                               apiResponse.data?.url;

      if (!collectRequestUrl) {
        this.logger.warn('No payment URL found in API response');
      }

      return {
        success: true,
        message: 'Payment request created successfully',
        order_id: (savedOrder._id as any).toString(),
        payment_link: collectRequestUrl,
        collect_request_url: collectRequestUrl,
      };

    } catch (error) {
      this.logger.error('Error creating payment:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || HttpStatus.BAD_GATEWAY;
        const message = error.response?.data?.message || 'External API error';
        throw new HttpException(
          `Payment gateway error: ${message}`,
          status >= 400 && status < 500 ? HttpStatus.BAD_REQUEST : HttpStatus.BAD_GATEWAY
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error while creating payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD_${timestamp}_${random}`;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  async getOrdersBySchool(schoolId: string): Promise<Order[]> {
    return this.orderModel.find({ school_id: schoolId }).exec();
  }
}