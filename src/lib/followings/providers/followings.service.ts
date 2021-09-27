import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Model, Types } from 'mongoose';
import {
  FollowersOutput,
  FollowingsOutput,
} from 'src/dtos/following/following.dto';
import { Following, FollowingDocument } from 'src/entities/following.entity';
import { UserDocument } from 'src/entities/user.entity';
import { UsersService } from 'src/lib/users/providers/users.service';
import { FOLLOWERS_PER_PAGE, FOLLOWINGS_PER_PAGE } from 'src/utils/constants';

@Injectable()
export class FollowingsService {
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}
  public async addFollowing(
    userId: string,
    followingId: string,
  ): Promise<void> {
    try {
      followingId.trim();
      const following = await this.followingModel.findOne({
        user: Types.ObjectId(userId),
        following: Types.ObjectId(followingId),
      });
      if (following) {
        throw new BadRequestException('You have been following this user');
      }
      if (userId.toString() !== followingId) {
        await Promise.all([
          this.usersService.updateFollowers(Types.ObjectId(followingId), 1),
          this.usersService.updateFollowings(Types.ObjectId(userId), 1),
          new this.followingModel({
            user: Types.ObjectId(userId),
            following: Types.ObjectId(followingId),
          }).save(),
        ]);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async unFollow(userId: string, followingId: string): Promise<void> {
    try {
      const followingDelete = await this.followingModel.findOneAndDelete({
        user: Types.ObjectId(userId),
        following: Types.ObjectId(followingId),
      });
      if (!followingDelete) {
        throw new BadRequestException('You haven\'t followed this person yet');
      }

      await Promise.all([
        this.usersService.updateFollowers(Types.ObjectId(followingId), -1),
        this.usersService.updateFollowings(Types.ObjectId(userId), -1),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFollowings(
    userId: string,
    pageNumber: number,
  ): Promise<FollowingsOutput[]> {
    const perPage = FOLLOWINGS_PER_PAGE;
    const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
    const followings = await this.followingModel
      .find({
        user: Types.ObjectId(userId),
      })
      .populate('following', ['displayName', 'avatar'])
      .skip(skip)
      .limit(perPage);
    return followings.map((i) => {
      const user = i.following as unknown as any;
      return {
        followingId: user._id.toString(),
        displayName: user.displayName,
        avatar: user.avatar,
      };
    });
  }
  public async getFollowers(
    userId: string,
    pageNumber: number,
  ): Promise<FollowersOutput[]> {
    try {
      const perPage = FOLLOWERS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const followings = await this.followingModel
        .find({
          following: Types.ObjectId(userId),
        })
        .populate('user', ['displayName', 'avatar'])
        .skip(skip)
        .limit(perPage);
      const followerIds: Types.ObjectId[] = followings.map((i) => {
        return i.user;
      });
      const followingIds = await this.getFollowingIds(userId, followerIds);
      return followings.map((i) => {
        const user = i.user as unknown as any;
        return {
          followerId: user._id.toHexString(),
          displayName: user.displayName,
          avatar: user.avatar,
          followed: user && followingIds.includes(user._id),
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFollowingIds(
    userId: string,
    followerIds?: Types.ObjectId[],
  ): Promise<Types.ObjectId[]> {
    let followings;
    if (!followerIds) {
      followings = await this.followingModel.find({
        user: Types.ObjectId(userId),
      });
    } else {
      followings = await this.followingModel.find({
        user: Types.ObjectId(userId),
        following: { $in: followerIds },
      });
    }
    return followings.map((i) => i.following);
  }
}
