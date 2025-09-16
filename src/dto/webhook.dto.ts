import { IsNotEmpty, IsString, IsObject, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsObject()
  @IsNotEmpty()
  order_info: OrderInfoDto;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  gateway_response?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class OrderInfoDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsOptional()
  custom_order_id?: string;

  @IsString()
  @IsOptional()
  school_id?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class WebhookResponseDto {
  success: boolean;
  message: string;
  processed_at: Date;
}