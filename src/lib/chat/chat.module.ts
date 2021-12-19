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
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateway/chat.gateway';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Chat.name,
                schema: ChatSchema,
            },
        ]),
        forwardRef(() => ConversationModule),
        forwardRef(() => UsersModule)
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
