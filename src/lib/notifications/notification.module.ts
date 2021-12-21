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
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './gateway/notification.gateway';
import { SocketSchema, Socket } from 'src/entities/socket.entity';
import { Notification, NotificationSchema } from 'src/entities/notification.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Notification.name,
                schema: NotificationSchema,
            },
        ]),
        forwardRef(() => ConversationModule),
        forwardRef(() => UsersModule),
        SocketModule,
        // NotificationGateway
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway],
    exports: [NotificationService],
})
export class NotificationModule { }
