import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: Types.ObjectId, required: true })
    postId: Types.ObjectId
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId
    @Prop({ type: Types.ObjectId, required: false })
    parentId: Types.ObjectId
    @Prop({ type: String, required: true })
    comment: string
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
export type CommentDocument = Comment & Document

