import {
  BadRequestException,
  Injectable, InternalServerErrorException, Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reaction, ReactionDocument } from 'src/entities/reaction.entity';
import { PostsService } from 'src/lib/posts/providers/posts.service';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
    private postService: PostsService
  ) { }
  public async addReactionToPost(userId, postId, reaction): Promise<void> {
    try {
      const checkPost = await this.postService.getPost(postId)
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại')
      }
      const updateReactCount = {
        $inc: {
          reactions: 1,
        }
      }
      await this.postService.updatePostCommentAndReactionCount(postId, updateReactCount)
      const addReact = new this.reactionModel({
        postId: Types.ObjectId(postId),
        userId: Types.ObjectId(userId),
        react: reaction
      })
      await addReact.save()
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

}
