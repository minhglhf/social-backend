import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, ReactionSchema } from 'src/entities/reaction.entity';
import { FollowingsModule } from '../followings/followings.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { ReactionsController } from './controllers/reactions.controller';
import { ReactionsService } from './providers/reactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Reaction.name,
        schema: ReactionSchema,
      },
    ]),
    forwardRef(() => UsersModule),
    PostsModule,
    FollowingsModule
  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
  exports: [ReactionsService],
})
export class ReactionsModule { }
