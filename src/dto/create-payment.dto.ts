import { IsNotEmpty, IsString, IsNumber, IsUrl, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  school_id: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsUrl()
  @IsNotEmpty()
  callback_url: string;
}

export class PaymentResponseDto {
  success: boolean;
  message: string;
  order_id?: string;
  payment_link?: string;
  collect_request_url?: string;
}
