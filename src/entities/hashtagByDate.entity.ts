import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class HashtagByDate {
  @Prop({ type: String, required: true })
  hashtag: string;
  @Prop({ type: Number, required: true })
  popularByDate: number;
}
export type HashtagByDateDocument = HashtagByDate & Document;
export const HashtagByDateSchema = SchemaFactory.createForClass(HashtagByDate);
