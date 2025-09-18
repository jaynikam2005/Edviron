import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  school_id: string;

  @Prop({ required: true })
  trustee_id: string;

  @Prop({ required: true, unique: true })
  custom_order_id: string;

  @Prop({ required: true })
  gateway_name: string;

  @Prop({ required: true, type: Object })
  student_info: {
    name: string;
    id: string;
    email: string;
    class?: string;
    section?: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
