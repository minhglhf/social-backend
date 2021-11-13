import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/entities/post.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsModule } from 'src/uploads/uploads.module';
import { FollowingsModule } from '../followings/followings.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { MediaFilesModule } from '../mediaFiles/mediaFiles.module';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './providers/posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    MediaFilesModule,
    HashtagsModule,
    FollowingsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, StringHandlersHelper],
  exports: [PostsService],
})
export class PostsModule {}
