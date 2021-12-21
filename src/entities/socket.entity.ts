import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationAction } from 'src/utils/enums';

@Schema({ timestamps: true })
export class Socket {
    @Prop({
        type: Types.ObjectId, required: true, ref: 'User'
    })
    userId: Types.ObjectId
    @Prop({
        type: String, required: true,
    })
    socketId: string

}

export const SocketSchema = SchemaFactory.createForClass(Socket);
export type SocketDocument = Socket & Document;
