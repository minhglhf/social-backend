import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ChatModule } from './lib/chat/chat.module';
import { ChatGateway } from './lib/chat/gateway/chat.gateway';
import { CommentsModule } from './lib/comments/comments.module';
import { ConversationModule } from './lib/conversation/conversation.module';
import { NotificationModule } from './lib/notifications/notification.module';
import { PostsModule } from './lib/posts/posts.module';
import { ReactionsModule } from './lib/reactions/reactions.module';
import { SearchModule } from './lib/search/search.module';
import { UsersModule } from './lib/users/users.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.getMongoOption();
      },
      inject: [ConfigService],
    }),
    UsersModule,
    PostsModule,
    SearchModule,
    CommentsModule,
    ReactionsModule,
    ChatModule,
    ConversationModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
