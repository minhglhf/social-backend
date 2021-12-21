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
        enum: NotificationAction,
        required: true
    })
    action: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export type NotificationDocument = Notification & Document;
