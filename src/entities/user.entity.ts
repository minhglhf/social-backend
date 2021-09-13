import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  password: string;
  @Prop({ type: Boolean, require: true })
  isActive: boolean;
  @Prop({ type: String, required: true })
  displayName: string;
  @Prop({ type: Date })
  birthday: Date;
  @Prop({ type: String })
  avatar: string;
  @Prop({ type: String })
  coverPhoto: string;
  @Prop({ type: String })
  address: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = Document & User;
