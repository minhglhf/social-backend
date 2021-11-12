import {
  BadRequestException,
  Injectable, InternalServerErrorException, Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserReaction } from 'src/dtos/reaction/reationsList.dto';
import { Reaction, ReactionDocument } from 'src/entities/reaction.entity';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { PostsService } from 'src/lib/posts/providers/posts.service';
import { UsersService } from 'src/lib/users/providers/users.service';
import { FOLLOWINGS_PER_PAGE } from 'src/utils/constants';
import { ReactionType, ReactionTypeQuery } from 'src/utils/enums';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
    private postService: PostsService,
    private usersSerivce: UsersService,
    private followingService: FollowingsService
  ) { }
  public async addReactionToPost(userId, postId, reaction): Promise<void> {
    try {
      const checkPost = await this.postService.getPost(postId)
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại')
      }
      const checkIfReact = await this.reactionModel.findOne({
        postId: Types.ObjectId(postId),
        userId: Types.ObjectId(userId)
      })
      if (checkIfReact) {
        throw new BadRequestException('bạn đã thêm react cho post này')
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

  public async getReactionsOfPost(userId, postId, reactType, pageNumber): Promise<UserReaction[]> {
    try {
      const perPage = FOLLOWINGS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const reactions = await this.reactionModel.find({ postId: Types.ObjectId(postId) })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-_id', '-__v', '-createdAt', '-updatedAt', '-postId'])
        .skip(skip)
        .limit(perPage)
      const followedUser = await this.followingService.getFollowingIds(userId)
      const userReact: UserReaction[] = [];
      reactions.forEach((react: any) => {
        const user = {
          userId: react.userId?._id.toString(),
          displayName: react.userId?.displayName,
          avatar: react.userId?.avatar,
          reaction: react.react,
          isFollowed: followedUser.findIndex((followedId) => followedId == react.userId?._id.toString()) !== -1 ? true : false
        }
        userReact.push(user)
      })
      if (reactType === ReactionTypeQuery.All) return userReact
      return userReact.filter((reaction: UserReaction) => reaction.reaction === reactType)
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  public async deleteReaction(userId, postId): Promise<void> {
    try {
      const post = await this.postService.getPost(postId)
      if (!post) throw new BadRequestException('Post không tồn tại')
      const react = await this.reactionModel.findOne({
        userId: Types.ObjectId(userId),
        postId: Types.ObjectId(postId)
      })
      if (!react) throw new BadRequestException('chưa thêm reactioon cho post này')
      const updateCommentCount = {
        $inc: {
          reactions: -1,
        },
      }
      await this.postService.updatePostCommentAndReactionCount(postId, updateCommentCount)
      await this.reactionModel.findByIdAndDelete(react._id.toString())
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }
}
