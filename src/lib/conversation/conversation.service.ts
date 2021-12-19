import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Model, ObjectId, Types } from 'mongoose';
import { userInfo } from 'os';
import { PostOutput, Reactions } from 'src/dtos/post/postNew.dto';
import { ChatDocument } from 'src/entities/chat.entity';
import { Conversation, ConversationDocument } from 'src/entities/conversation.entity';
import { GroupDocument } from 'src/entities/group.entity';
import { FileType, Post, PostDocument } from 'src/entities/post.entity';
import { User, UserDocument } from 'src/entities/user.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { GroupsService } from 'src/lib/groups/groups.service';
import { HashtagsService } from 'src/lib/hashtags/hashtags.service';
@Injectable()
export class ConversationService {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    ) { }

    public async createNewConversation(people: ObjectId[]) {
        try {
            const checkConver = await this.getConversationId(people)
            if (!checkConver) {
                const newConver = new this.conversationModel({
                    peopleInChat: people,
                    messages: []
                })
                return await newConver.save()
            }

        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    public async saveChatToConversation(people: ObjectId[], chat: string) {
        try {
            const converUpdate = await this.conversationModel.findOneAndUpdate(
                {
                    peopleInChat: { $all: people },
                },
                {
                    $push: {
                        messages: {
                            chatId: Types.ObjectId(chat)
                        }
                    }
                },
                {
                    new: true,
                })
            return converUpdate
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    public async getConversation(conversationId: string) {
        try {
            const conver = await this.conversationModel
                .findById(
                    conversationId
                )
                .select(['messages', '_id'])
                // .select(['messages._id'])
                .populate({
                    path: 'messages',
                    populate: [
                        {
                            path: 'chatId',
                            model: 'Chat',
                            select: 'author content createdAt',
                            populate: [
                                {
                                    path: 'author',
                                    model: 'User',
                                    select: 'displayName avatar'
                                }
                            ]
                        }
                    ],
                    select: 'messages'
                })
            // .populate('messages.chatId', ['author', 'content', 'createdAt'])
            // .select(['messages._id'])
            // /.populate('messages.chatId.author', ['displayName', 'avatar'])
            console.log(conver)
            return conver
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    public async getConversationId(people: ObjectId[]) {
        try {
            const conver = await this.conversationModel
                .findOne(
                    {
                        peopleInChat: { $all: people },
                    },
                )
                .select(['_id'])
            return conver
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

}
