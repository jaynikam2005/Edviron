import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateWebhookLogsDto {
  @IsObject()
  @IsNotEmpty()
  raw_payload: Record<string, any>;

  @IsDateString()
  @IsOptional()
  timestamp?: Date;

  @IsString()
  @IsOptional()
  webhook_source?: string;

  @IsString()
  @IsOptional()
  event_type?: string;

  @IsString()
  @IsOptional()
  processing_status?: string = 'received';
}
