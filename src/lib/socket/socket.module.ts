import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/entities/chat.entity';
import { Post, PostSchema } from 'src/entities/post.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { ConversationModule } from '../conversation/conversation.module';
import { FollowingsModule } from '../followings/followings.module';
import { GroupsModule } from '../groups/groups.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { MediaFilesModule } from '../mediaFiles/mediaFiles.module';
import { UsersModule } from '../users/users.module';
import { SocketController } from './socket.controller';
import { SocketService } from './socket.service';
import { SocketSchema, Socket } from 'src/entities/socket.entity';
import { Notification, NotificationSchema } from 'src/entities/notification.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Socket.name,
                schema: SocketSchema,
            },
        ]),
        forwardRef(() => ConversationModule),
        forwardRef(() => UsersModule)
    ],
    controllers: [SocketController],
    providers: [SocketService],
    exports: [SocketService],
})
export class SocketModule { }
