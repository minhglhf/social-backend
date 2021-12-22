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
import { Notification, NotificationDocument } from 'src/entities/notification.entity';
import { FileType, Post, PostDocument } from 'src/entities/post.entity';
import { Socket, SocketDocument } from 'src/entities/socket.entity';
import { UserDocument } from 'src/entities/user.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { GroupsService } from 'src/lib/groups/groups.service';
import { HashtagsService } from 'src/lib/hashtags/hashtags.service';
import { ConversationService } from '../conversation/conversation.service';
@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        // private conversationService: ConversationService
    ) { }

    public async saveToNotifiList(yourId: string, targetId: string, action: string, typeOfPost: string, postId: string) {
        try {
            const save = new this.notificationModel({
                userDoAction: Types.ObjectId(yourId),
                userRecievedAction: Types.ObjectId(targetId),
                action,
                typeOfPost,
                postId: Types.ObjectId(postId)
            })
            return await save.save()
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    public async getNotifilist(yourId: string) {
        try {
            const perPage = 10;
            // const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
            const notiList = await this.notificationModel
                .find({
                    userRecievedAction: Types.ObjectId(yourId)
                })
                .populate('userDoAction', ['displayName', 'avatar'])
                .select(['-__v'])
                .populate('userRecievedAction', ['displayName', 'avatar'])
                .select(['-__v'])
                .sort({ createdAt: -1 })
                // .skip(skip)
                .limit(perPage);
            return await notiList
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }
}
