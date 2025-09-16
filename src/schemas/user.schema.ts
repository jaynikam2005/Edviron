import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Should be hashed with bcrypt

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });