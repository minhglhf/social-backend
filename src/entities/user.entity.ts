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
  @Prop({ type: String, required: true })
  displayNameNoAccent: string;
  @Prop({ type: Date })
  birthday: Date;
  @Prop({ type: String })
  avatar: string;
  @Prop({ type: String })
  coverPhoto: string;
  @Prop({
    type: {
      province: { type: Number, ref: 'Province', required: true },
      district: { type: Number, ref: 'District', required: true },
      ward: { type: Number, ref: 'Ward', required: true },
    },
    required: true,
  })
  address: {
    province: number;
    district: number;
    ward: number;
  };
  @Prop({ type: Number, required: true })
  sex: number;
  @Prop({ type: Number, required: true })
  followings: number;
  @Prop({ type: Number, required: true })
  followers: number;
}
export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = Document & User;
UserSchema.index({ displayNameNoAccent: 1, isActive: 1, _id: 1 });
UserSchema.index({ displayName: 1 });
