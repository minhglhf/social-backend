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
  @Prop({ type: String })
  imageOrVideo: string;
  @Prop({ type: [String] })
  hashtag: [string];
  @Prop({ type: [String] })
  userLike: [string];
  @Prop({ type: [String] })
  userView: [string];
  @Prop({ type: [String] })
  comment: [string];
}
export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = Post & Document;
