import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Ward {
  @Prop({ type: Number, required: true })
  _id: number;
  @Prop({ type: Number, required: true })
  province: number;
  @Prop({ type: Number, required: true })
  district: number;
  @Prop({ type: String, required: true })
  name: string;
}
export const WardSchema = SchemaFactory.createForClass(Ward);
export type WardDocument = Ward & Document;
