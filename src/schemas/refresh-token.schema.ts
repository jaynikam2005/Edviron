import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, ref: 'User' })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: false })
  is_revoked: boolean;

  @Prop()
  revoked_at?: Date;

  @Prop()
  revoked_by?: string;

  @Prop()
  ip_address?: string;

  @Prop()
  user_agent?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Create indexes
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ user_id: 1 });
RefreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });