import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({
  timestamps: true,
})
export class StudentInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  email: string;
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({ required: true, index: true })
  school_id: string;

  @Prop({ required: true })
  trustee_id: string;

  @Prop({ type: StudentInfo, required: true })
  student_info: StudentInfo;

  @Prop({ required: true })
  gateway_name: string;

  @Prop({ unique: true, index: true })
  custom_order_id: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Create indexes
OrderSchema.index({ school_id: 1 });
OrderSchema.index({ custom_order_id: 1 });