import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ReactionType } from "src/utils/enums";


@Schema({ timestamps: true })
export class Reaction {
    @Prop({ type: Types.ObjectId, required: true })
    postId: Types.ObjectId
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId
    @Prop({ type: String, required: true })
    commentId: string
    @Prop({ type: String, enum: ReactionType, require: true })
    react: string
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
export type CommentDocument = Comment & Document