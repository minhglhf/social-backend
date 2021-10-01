import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Province {
  @Prop({ type: Number, required: true })
  _id: number;
  @Prop({ type: String, required: true })
  name: string;
}
export const ProvinceSchema = SchemaFactory.createForClass(Province);
export type ProvinceDocument = Province & Document;
