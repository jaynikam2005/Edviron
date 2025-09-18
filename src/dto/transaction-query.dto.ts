import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TransactionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn([
    'payment_time',
    'createdAt',
    'updatedAt',
    'order_amount',
    'transaction_amount',
    'status',
    'school_id',
    'custom_order_id',
  ])
  sort?: string = 'payment_time';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string = 'desc';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  payment_mode?: string;

  @IsOptional()
  @IsString()
  gateway_name?: string;
}

export class TransactionResponseDto {
  _id: string;
  order_id: string;
  custom_order_id: string;
  school_id: string;
  trustee_id: string;
  student_info: {
    name: string;
    id: string;
    email: string;
  };
  gateway_name: string;
  order_amount: number;
  transaction_amount: number;
  payment_mode: string;
  payment_details: any;
  bank_reference?: string;
  payment_message?: string;
  status: string;
  error_message?: string;
  payment_time?: Date;
  order_created_at: Date;
  status_updated_at: Date;
}

export class PaginatedTransactionResponseDto {
  data: TransactionResponseDto[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
  sort: {
    field: string;
    order: string;
  };
}

export class TransactionStatusResponseDto {
  custom_order_id: string;
  status: string;
  order_amount?: number;
  transaction_amount?: number;
  payment_mode?: string;
  payment_time?: Date;
  error_message?: string;
  last_updated: Date;
}
