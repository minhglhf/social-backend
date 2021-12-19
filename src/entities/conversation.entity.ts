import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation {
    @Prop({
        type: [{
            type: Types.ObjectId,
            required: true,
            ref: 'User'
        }],
        required: true
    })
    peopleInChat: []
    @Prop({
        type: [{
            chatId: {
                type: Types.ObjectId,
                required: true,
                ref: 'Chat'
            }
        }],
        required: true
    })
    messages: [];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
export type ConversationDocument = Conversation & Document;
