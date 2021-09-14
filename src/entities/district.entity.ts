import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class District {
  @Prop({ type: Number, required: true })
  _id: number;
  @Prop({ type: Number, required: true })
  province: number;
  @Prop({ type: String, required: true })
  name: string;
}
export const DistrictSchema = SchemaFactory.createForClass(District);
export type DistrictDocument = District & Document;
