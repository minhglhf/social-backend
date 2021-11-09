import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId })
  group: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true })
  user: Types.ObjectId;
  @Prop({ type: String })
  description: string;
  @Prop({ type: [String] })
  mediaFiles: string[];
  @Prop({ type: [String] })
  hashtags: string[];
  @Prop({ type: Number })
  reactions: number;
  @Prop({ type: Number })
  comments: Number;
}
export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = Post & Document;
