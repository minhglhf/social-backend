import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { userInfo } from 'os';
import { PostOutput, Reactions } from 'src/dtos/post/postNew.dto';
import { Chat, ChatDocument } from 'src/entities/chat.entity';
import { GroupDocument } from 'src/entities/group.entity';
import { FileType, Post, PostDocument } from 'src/entities/post.entity';
import { UserDocument } from 'src/entities/user.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { GroupsService } from 'src/lib/groups/groups.service';
import { HashtagsService } from 'src/lib/hashtags/hashtags.service';
import { ConversationService } from '../conversation/conversation.service';
@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        private conversationService: ConversationService
    ) { }

    public async sendChat(yourId: string, friendId: string, content: string): Promise<void> {
        try {
            const newChat = new this.chatModel({
                author: Types.ObjectId(yourId),
                content
            })
            await newChat.save()
            const peoples = []
            peoples.push(Types.ObjectId(yourId))
            peoples.push(Types.ObjectId(friendId))
            await this.conversationService.saveChatToConversation(peoples, newChat._id)
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }
}
