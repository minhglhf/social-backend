import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, ReactionSchema } from 'src/entities/reaction.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsModule } from '../followings/followings.module';
import { GroupsModule } from '../groups/groups.module';
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
    FollowingsModule,
    forwardRef(() => GroupsModule)
  ],
  providers: [ReactionsService, StringHandlersHelper],
  controllers: [ReactionsController],
  exports: [ReactionsService],
})
export class ReactionsModule { }
