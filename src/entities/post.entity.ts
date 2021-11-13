import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId })
  group: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
  @Prop({ type: String })
  description: string;
  @Prop({ type: [String] })
  mediaFiles: string[];
  @Prop({ type: [String] })
  hashtags: string[];
  @Prop({ type: Number })
  comments: number;
  @Prop({
    type: {
      loves: { type: Number, required: true },
      likes: { type: Number, required: true },
      hahas: { type: Number, required: true },
      wows: { type: Number, required: true },
      sads: { type: Number, required: true },
      angrys: { type: Number, required: true },
    },
    required: true,
  })
  reactions: {
    loves: number;
    likes: number;
    hahas: number;
    wows: number;
    sads: number;
    angrys: number;
  };
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
