import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumberString,
  IsIn,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class TransactionQueryEnhancedDto {
  @IsOptional()
  @IsNumberString({}, { message: 'page must be a valid number' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' || typeof value === 'number' ? String(value) : '',
  )
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'limit must be a valid number' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' || typeof value === 'number' ? String(value) : '',
  )
  limit?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  school_id?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  trustee_id?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 50)
  gateway_name?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'cancelled'], {
    message: 'status must be one of: pending, completed, failed, cancelled',
  })
  status?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'start_date must be in YYYY-MM-DD format',
  })
  start_date?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'end_date must be in YYYY-MM-DD format',
  })
  end_date?: string;

  @IsOptional()
  @IsIn(['createdAt', 'payment_time', 'order_amount', 'custom_order_id'], {
    message:
      'sort must be one of: createdAt, payment_time, order_amount, custom_order_id',
  })
  sort?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'order must be either asc or desc',
  })
  order?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  search?: string;
}
