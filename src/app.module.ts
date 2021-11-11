import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { CommentsModule } from './lib/comments/comments.module';
import { PostsModule } from './lib/posts/posts.module';
import { ReactionsModule } from './lib/reactions/reactions.module';
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
    CommentsModule,
    ReactionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
