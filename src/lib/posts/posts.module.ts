import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/entities/posts.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsModule } from 'src/uploads/uploads.module';
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
    UploadsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, StringHandlersHelper],
  exports: [PostsService],
})
export class PostsModule {}
