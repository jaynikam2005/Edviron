import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogsDocument = WebhookLogs & Document;

@Schema({
  timestamps: true,
})
export class WebhookLogs {
  @Prop({ type: Object, required: true })
  raw_payload: Record<string, any>;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop()
  webhook_source: string;

  @Prop()
  event_type: string;

  @Prop({ default: 'received' })
  processing_status: string;

  @Prop()
  error_message: string;
}

export const WebhookLogsSchema = SchemaFactory.createForClass(WebhookLogs);

// Create indexes
WebhookLogsSchema.index({ timestamp: -1 });
WebhookLogsSchema.index({ webhook_source: 1 });
WebhookLogsSchema.index({ event_type: 1 });
WebhookLogsSchema.index({ processing_status: 1 });