import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/entities/chat.entity';
import { Conversation, ConversationSchema } from 'src/entities/conversation.entity';
import { Post, PostSchema } from 'src/entities/post.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsModule } from '../followings/followings.module';
import { GroupsModule } from '../groups/groups.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { MediaFilesModule } from '../mediaFiles/mediaFiles.module';
import { UsersModule } from '../users/users.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Conversation.name,
                schema: ConversationSchema,
            },
        ]),
        // // forwardRef(() => ChatGateway),
        forwardRef(() => UsersModule)
    ],
    controllers: [ConversationController],
    providers: [ConversationService],
    exports: [ConversationService],
})
export class ConversationModule { }
