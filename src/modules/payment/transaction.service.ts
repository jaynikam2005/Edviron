import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../../schemas/order-status.schema';
import {
  TransactionQueryDto,
  PaginatedTransactionResponseDto,
  TransactionResponseDto,
  TransactionStatusResponseDto,
} from '../../dto/transaction-query.dto';

interface MatchConditions {
  [key: string]: string | number | undefined;
}

interface SortObject {
  [key: string]: 1 | -1;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name)
    private readonly orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  private validateDemoUser(
    user?: { email?: string; userId?: string; role?: string },
    operation?: string,
  ): boolean {
    const isDemoUser = user?.email === 'admin@edviron.com';

    if (!isDemoUser && operation) {
      this.logger.log(
        `Non-demo user ${user?.email || 'unknown'} attempted to access ${operation}`,
      );
    } else if (isDemoUser && operation) {
      this.logger.log(`Demo user ${user?.email} accessing ${operation}`);
    }

    return isDemoUser;
  }

  private getEmptyTransactionResponse(
    query: TransactionQueryDto,
  ): PaginatedTransactionResponseDto {
    return {
      data: [],
      pagination: {
        current_page: query.page || 1,
        total_pages: 0,
        total_items: 0,
        items_per_page: query.limit || 10,
        has_next: false,
        has_prev: false,
      },
      sort: {
        field: query.sort || 'payment_time',
        order: query.order || 'desc',
      },
    };
  }

  private buildMatchConditions(
    query: TransactionQueryDto,
  ): Record<string, any> {
    const { status, payment_mode, gateway_name } = query;
    const matchConditions: Record<string, any> = {};
    if (status) matchConditions['orderStatus.status'] = status;
    if (payment_mode)
      matchConditions['orderStatus.payment_mode'] = payment_mode;
    if (gateway_name) matchConditions['gateway_name'] = gateway_name;
    return matchConditions;
  }

  private buildSortObject(sort: string, order: string): Record<string, 1 | -1> {
    const sortObj: Record<string, 1 | -1> = {};
    const orderValue = order === 'asc' ? 1 : -1;
    switch (sort) {
      case 'payment_time':
        sortObj['orderStatus.payment_time'] = orderValue;
        break;
      case 'order_amount':
        sortObj['orderStatus.order_amount'] = orderValue;
        break;
      case 'transaction_amount':
        sortObj['orderStatus.transaction_amount'] = orderValue;
        break;
      case 'status':
        sortObj['orderStatus.status'] = orderValue;
        break;
      case 'school_id':
        sortObj['school_id'] = orderValue;
        break;
      case 'custom_order_id':
        sortObj['custom_order_id'] = orderValue;
        break;
      default:
        sortObj['createdAt'] = orderValue;
    }
    return sortObj;
  }

  async getAllTransactions(
    query: TransactionQueryDto,
    user?: { email?: string; userId?: string; role?: string },
  ): Promise<PaginatedTransactionResponseDto> {
    // Check if user is the demo user
    const isDemoUser = this.validateDemoUser(user, 'transactions');

    // For non-demo users, return empty results
    if (!isDemoUser) {
      return this.getEmptyTransactionResponse(query);
    }
    const {
      page = 1,
      limit = 10,
      sort = 'payment_time',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const matchConditions = this.buildMatchConditions(query);
    const sortObj = this.buildSortObject(sort, order);

    const pipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus',
        },
      },
      {
        $unwind: {
          path: '$orderStatus',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchConditions,
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
          status_updated_at: '$orderStatus.updatedAt',
        },
      },
      {
        $sort: sortObj,
      },
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.orderModel.aggregate(countPipeline).exec();
    const totalItems =
      countResult.length > 0
        ? Number((countResult[0] as { total?: number })?.total || 0)
        : 0;

    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
    const transactions = (await this.orderModel
      .aggregate(dataPipeline)
      .exec()) as TransactionResponseDto[];

    const totalPages = Math.ceil(totalItems / limit);

    this.logger.log(
      `Retrieved ${transactions.length} transactions (page ${page}/${totalPages})`,
    );

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
    query: TransactionQueryDto,
    user?: { email?: string; userId?: string; role?: string },
  ): Promise<PaginatedTransactionResponseDto> {
    // Check if user is the demo user
    const isDemoUser = this.validateDemoUser(
      user,
      `school transactions for ${schoolId}`,
    );

    // For non-demo users, return empty results
    if (!isDemoUser) {
      return this.getEmptyTransactionResponse(query);
    }
    const {
      page = 1,
      limit = 10,
      sort = 'payment_time',
      order = 'desc',
      status,
      payment_mode,
    } = query;
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: MatchConditions = { school_id: schoolId };
    if (status) matchConditions['orderStatus.status'] = status;
    if (payment_mode)
      matchConditions['orderStatus.payment_mode'] = payment_mode;

    // Build sort object
    const sortObj: SortObject = {};
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
        $match: { school_id: schoolId },
      },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus',
        },
      },
      {
        $unwind: {
          path: '$orderStatus',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchConditions,
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
          status_updated_at: '$orderStatus.updatedAt',
        },
      },
      {
        $sort: sortObj,
      },
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.orderModel.aggregate(countPipeline).exec();
    const totalItems =
      countResult.length > 0
        ? Number((countResult[0] as { total?: number })?.total || 0)
        : 0;

    // Get paginated data
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    const transactions = (await this.orderModel
      .aggregate(dataPipeline)
      .exec()) as TransactionResponseDto[];

    const totalPages = Math.ceil(totalItems / limit);

    this.logger.log(
      `Retrieved ${transactions.length} transactions for school ${schoolId} (page ${page}/${totalPages})`,
    );

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

  async getTransactionStatus(
    customOrderId: string,
    user?: { email?: string; userId?: string; role?: string },
  ): Promise<TransactionStatusResponseDto> {
    // Check if user is the demo user
    const isDemoUser = this.validateDemoUser(
      user,
      `transaction status for ${customOrderId}`,
    );

    // For non-demo users, deny access
    if (!isDemoUser) {
      throw new NotFoundException(
        `Transaction with custom_order_id '${customOrderId}' not found`,
      );
    }
    const pipeline = [
      {
        $match: { custom_order_id: customOrderId },
      },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus',
        },
      },
      {
        $unwind: {
          path: '$orderStatus',
          preserveNullAndEmptyArrays: true,
        },
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
          last_updated: '$orderStatus.updatedAt',
        },
      },
    ];

    const result = await this.orderModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      throw new NotFoundException(
        `Transaction with custom_order_id '${customOrderId}' not found`,
      );
    }

    const transaction = result[0];

    if (!transaction || typeof transaction !== 'object') {
      throw new NotFoundException(
        `Transaction with custom_order_id '${customOrderId}' not found`,
      );
    }

    const safeGet = (
      obj: unknown,
      key: string,
      defaultValue: unknown = undefined,
    ): unknown => {
      return obj && typeof obj === 'object' && obj !== null && key in obj
        ? (obj as Record<string, unknown>)[key]
        : defaultValue;
    };

    this.logger.log(`Retrieved transaction status for order: ${customOrderId}`);

    return {
      custom_order_id: String(safeGet(transaction, 'custom_order_id', '')),
      status: String(safeGet(transaction, 'status', 'pending')),
      order_amount: Number(safeGet(transaction, 'order_amount', 0)),
      transaction_amount: Number(safeGet(transaction, 'transaction_amount', 0)),
      payment_mode: String(safeGet(transaction, 'payment_mode', '')),
      payment_time: safeGet(transaction, 'payment_time')
        ? new Date(String(safeGet(transaction, 'payment_time')))
        : undefined,
      error_message: safeGet(transaction, 'error_message')
        ? String(safeGet(transaction, 'error_message'))
        : undefined,
      last_updated: safeGet(transaction, 'last_updated')
        ? new Date(String(safeGet(transaction, 'last_updated')))
        : new Date(),
    };
  }
}
