import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  school_id: string;

  @Prop({ required: true })
  trustee_id: string;

  @Prop({ required: true })
  custom_order_id: string;

  @Prop({ required: true })
  gateway_name: string;

  @Prop({ required: true })
  order_amount: number;

  @Prop({ required: true })
  transaction_amount: number;

  @Prop({ required: true })
  payment_mode: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  payment_time: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
