import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    author: Types.ObjectId
    @Prop({ type: String, required: true })
    content: string
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
export type ChatDocument = Chat & Document;
