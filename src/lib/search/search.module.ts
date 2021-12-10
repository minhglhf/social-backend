import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/entities/post.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsModule } from 'src/uploads/uploads.module';
import { FollowingsModule } from '../followings/followings.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { MediaFilesModule } from '../mediaFiles/mediaFiles.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './providers/search.service';

@Module({
  imports: [
    MediaFilesModule,
    HashtagsModule,
    FollowingsModule,
    PostsModule,
    UsersModule
  ],
  controllers: [SearchController],
  providers: [SearchService, StringHandlersHelper],
  exports: [SearchService],
})
export class SearchModule { }
