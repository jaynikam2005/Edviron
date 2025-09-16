import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderStatusDto {
  @IsNotEmpty()
  collect_id: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  order_amount: number;

  @IsNumber()
  @IsNotEmpty()
  transaction_amount: number;

  @IsString()
  @IsNotEmpty()
  payment_mode: string;

  @IsObject()
  @IsOptional()
  payment_details?: Record<string, any>;

  @IsString()
  @IsOptional()
  bank_reference?: string;

  @IsString()
  @IsOptional()
  payment_message?: string;

  @IsEnum(['pending', 'success', 'failed', 'cancelled'])
  @IsOptional()
  status?: string = 'pending';

  @IsString()
  @IsOptional()
  error_message?: string;

  @IsDateString()
  @IsOptional()
  payment_time?: Date;
}