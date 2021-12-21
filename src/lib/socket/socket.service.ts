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
export class SocketService {
    constructor(
        @InjectModel(Socket.name) private socketModel: Model<SocketDocument>,
        // private conversationService: ConversationService
    ) { }

    public async saveToSocketId(userId: string, socketId: string) {
        try {
            const socket = new this.socketModel({
                userId: Types.ObjectId(userId),
                socketId
            })
            return await socket.save()
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    public async deleteSocketId(userId: string) {
        try {
            const skid = await this.socketModel.findOneAndDelete({
                userId: Types.ObjectId(userId)
            })
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    public async getSocketId(userId: string) {
        try {
            const skid = await this.socketModel.findOne({
                userId: Types.ObjectId(userId)
            })
            return skid
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }
}
