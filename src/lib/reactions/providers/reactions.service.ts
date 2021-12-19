import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserReaction } from 'src/dtos/reaction/reationsList.dto';
import { StatisticOutPut } from 'src/dtos/statistic/statistic.dto';
import { Reaction, ReactionDocument } from 'src/entities/reaction.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { PostsService } from 'src/lib/posts/providers/posts.service';
import { UsersService } from 'src/lib/users/providers/users.service';
import { FOLLOWINGS_PER_PAGE, VIET_NAM_TZ } from 'src/utils/constants';
import { ReactionType, ReactionTypeQuery } from 'src/utils/enums';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private postService: PostsService,
    private usersSerivce: UsersService,
    private followingService: FollowingsService,
  ) {}
  public async addReactionToPost(userId, postId, reaction) {
    try {
      const checkPost = await this.postService.getPost(postId);
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại');
      }
      const checkIfReact = await this.reactionModel.findOne({
        postId: Types.ObjectId(postId),
        userId: Types.ObjectId(userId),
      });
      console.log(checkIfReact);
      if (checkIfReact) {
        // throw new BadRequestException('bạn đã thêm react cho post này');
        const updateOldReactCount = this.getUpdate(checkIfReact.react, -1);
        const updateNewReactCount = this.getUpdate(reaction, 1);
        const updateReactCount = await Promise.all([
          this.postService.updatePostCommentAndReactionCount(
            postId,
            updateOldReactCount,
          ),
          this.postService.updatePostCommentAndReactionCount(
            postId,
            updateNewReactCount,
          ),
          this.reactionModel.findByIdAndUpdate(
            checkIfReact._id,
            {
              react: reaction,
            },
            {
              new: true,
            },
          ),
        ]);
        return updateReactCount[2];
      }
      const updateReactCount = this.getUpdate(reaction, 1);
      await this.postService.updatePostCommentAndReactionCount(
        postId,
        updateReactCount,
      );
      const addReact = new this.reactionModel({
        postId: Types.ObjectId(postId),
        userId: Types.ObjectId(userId),
        react: reaction,
      });
      return await addReact.save();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getReactionsOfPost(
    userId,
    postId,
    reactType,
    pageNumber,
  ): Promise<UserReaction[]> {
    try {
      const perPage = FOLLOWINGS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const reactions = await this.reactionModel
        .find({ postId: Types.ObjectId(postId) })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-_id', '-__v', '-createdAt', '-updatedAt', '-postId'])
        .skip(skip)
        .limit(perPage);
      const followedUser = await this.followingService.getFollowingIds(userId);
      const userReact: UserReaction[] = [];
      reactions.forEach((react: any) => {
        const user = {
          userId: react.userId?._id.toString(),
          displayName: react.userId?.displayName,
          avatar: react.userId?.avatar,
          reaction: react.react,
          isFollowed:
            followedUser.findIndex(
              (followedId) => followedId == react.userId?._id.toString(),
            ) !== -1
              ? true
              : false,
        };
        userReact.push(user);
      });
      if (reactType === ReactionTypeQuery.All) return userReact;
      return userReact.filter(
        (reaction: UserReaction) => reaction.reaction === reactType,
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async deleteReaction(userId, postId): Promise<void> {
    try {
      const post = await this.postService.getPost(postId);
      if (!post) throw new BadRequestException('Post không tồn tại');
      const react = await this.reactionModel.findOne({
        userId: Types.ObjectId(userId),
        postId: Types.ObjectId(postId),
      });
      if (!react)
        throw new BadRequestException('chưa thêm reaction cho post này');
      const updateCommentCount = this.getUpdate(react.react, -1);
      await this.postService.updatePostCommentAndReactionCount(
        postId,
        updateCommentCount,
      );
      await this.reactionModel.findByIdAndDelete(react._id.toString());
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  private getUpdate(react: string, count: number) {
    const update = {
      $inc: {},
    };
    switch (react) {
      case ReactionType.Love:
        update.$inc = {
          'reactions.loves': count,
        };
        break;
      case ReactionType.Like:
        update.$inc = {
          'reactions.likes': count,
        };
        break;
      case ReactionType.Haha:
        update.$inc = {
          'reactions.hahas': count,
        };
        break;
      case ReactionType.Wow:
        update.$inc = {
          'reactions.wows': count,
        };
        break;
      case ReactionType.Sad:
        update.$inc = {
          'reactions.sads': count,
        };
        break;
      case ReactionType.Angry:
        update.$inc = {
          'reactions.angrys': count,
        };
        break;
    }
    return update;
  }
  public async getReactionStatisticByTime(
    userId: string,
    time: string,
  ): Promise<StatisticOutPut[]> {
    try {

      const range = this.stringHandlersHelper.getStartAndEndDateWithTime(time);
      const postsToSearch = (
        await this.postService.getPostIdsInProfile(userId)
      ).map((postId) => Types.ObjectId(postId));
      const reactionsStatistic = await this.reactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(range[0]), $lte: new Date(range[1]) },
            postId: { $in: postsToSearch },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: { date: '$createdAt', timezone: VIET_NAM_TZ } },
              month: { $month: { date: '$createdAt', timezone: VIET_NAM_TZ } },
              day: {
                $dayOfMonth: { date: '$createdAt', timezone: VIET_NAM_TZ },
              },
            },
            date: { $first: '$createdAt' },
            scales: { $sum: 1 },
          },
        },
        {
          $sort: { date: 1 },
        },
        {
          $project: {
            date: 1,
            scales: 1,
            _id: 0,
          },
        },
      ]);

      const format = 'YYYY-MM-DD';
      return reactionsStatistic.map((i) => {
        const scales = (i as any).scales;
        const date = this.stringHandlersHelper.getDateWithTimezone(
          (i as any).date,
          VIET_NAM_TZ,
          format,
        );
        return {
          scales: scales,
          date: date,
        };
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
