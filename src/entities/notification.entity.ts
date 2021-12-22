import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationAction } from 'src/utils/enums';

@Schema({ timestamps: true })
export class Notification {
    @Prop({
        type: Types.ObjectId, required: true, ref: 'User'
    })
    userDoAction: Types.ObjectId
    @Prop({
        type: Types.ObjectId, required: true, ref: 'User'
    })
    userRecievedAction: Types.ObjectId
    @Prop({
        type: String,
        required: true
    })
    action: string
    @Prop({
        type: String,
        required: true
    })
    typeOfPost: string
    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: 'Post'
    })
    postId: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export type NotificationDocument = Notification & Document;
