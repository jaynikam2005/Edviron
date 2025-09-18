import { IsString, IsOptional, IsNumber } from 'class-validator';

export class OrderInfoDto {
  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  @IsString()
  custom_order_id?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class WebhookPayloadDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  order_info?: OrderInfoDto;

  @IsOptional()
  gateway_response?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class WebhookResponseDto {
  success: boolean;
  message: string;
  processed_at: Date;
}
