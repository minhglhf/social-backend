import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ReactionType } from "src/utils/enums";


@Schema({ timestamps: true })
export class Reaction {
    @Prop({ type: Types.ObjectId, required: false })
    postId: Types.ObjectId
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId
    @Prop({ type: String, required: false })
    commentId: string
    @Prop({ type: String, enum: ReactionType, require: true })
    react: string
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction)
export type ReactionDocument = Reaction & Document