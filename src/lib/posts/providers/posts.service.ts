import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { userInfo } from 'os';
import { PostOutput, Reactions } from 'src/dtos/post/postNew.dto';
import { GroupDocument } from 'src/entities/group.entity';
import { FileType, Post, PostDocument } from 'src/entities/post.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { GroupsService } from 'src/lib/groups/groups.service';
import { HashtagsService } from 'src/lib/hashtags/hashtags.service';
import { MediaFilesService } from 'src/lib/mediaFiles/mediaFiles.service';
import {
  POSTS_PER_PAGE,
  TRENDING_LENGTH,
  VIET_NAM_TZ,
} from 'src/utils/constants';
import { PostLimit } from 'src/utils/enums';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private filesService: MediaFilesService,
    private followingsService: FollowingsService,
    private groupsService: GroupsService,
    private hashtagsService: HashtagsService,
  ) {}

  public async createNewPost(
    userId: string,
    description: string,
    imageOrVideos: Express.Multer.File[],
    groupId: string,
  ): Promise<void> {
    try {
      if (groupId) {
        if (!(await this.groupsService.IsMemberOfGroup(userId, groupId)))
          throw new BadRequestException('You have not joined the group');
      }
      const fileUrlPromises = [];
      for (const item of imageOrVideos) {
        const filePath = `post/imageOrVideos/${userId}${this.stringHandlersHelper.generateString(
          15,
        )}`;
        const promise = this.filesService.saveFile(
          item,
          filePath,
          description,
          userId,
          groupId,
        );
        fileUrlPromises.push(promise);
      }

      const fileUrls: FileType[] = await Promise.all(fileUrlPromises);
      const hashtags =
        this.stringHandlersHelper.getHashtagFromString(description);
      const newPost: Partial<PostDocument> = {
        group: Types.ObjectId(groupId),
        user: Types.ObjectId(userId),
        description: description,
        mediaFiles: fileUrls,
        hashtags: hashtags,
        reactions: {
          loves: 0,
          likes: 0,
          hahas: 0,
          wows: 0,
          sads: 0,
          angrys: 0,
        },
        comments: 0,
      };
      if (!groupId) delete newPost.group;
      await Promise.all([
        new this.postModel(newPost).save(),
        this.hashtagsService.addHastags(hashtags),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getPost(postId: string): Promise<Post> {
    try {
      return await this.postModel.findById(postId);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public getPostsWithLimit(
    pageNumber: number,
    currentUser: string,
    limit: PostLimit,
    groupId: string,
  ): Promise<PostOutput[]> {
    switch (limit) {
    case PostLimit.Group:
      return this.getPostsGroup(pageNumber, currentUser, groupId);
    case PostLimit.Profile:
      return this.getPostsProfile(pageNumber, currentUser);
    case PostLimit.NewsFeed:
    default:
      return this.getPostsNewFeed(pageNumber, currentUser);
    }
  }

  public async updatePostCommentAndReactionCount(
    postId: string,
    update,
  ): Promise<Post> {
    try {
      return await this.postModel.findByIdAndUpdate(postId, update);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  private async getPostsGroup(
    pageNumber: number,
    currentUser: string,
    groupId: string,
  ): Promise<PostOutput[]> {
    try {
      if (!(await this.groupsService.IsMemberOfGroup(currentUser, groupId)))
        throw new BadRequestException('You have not joined the group');
      return await this.getPosts(
        pageNumber,
        currentUser,
        PostLimit.Group,
        groupId,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPostsProfile(
    pageNumber: number,
    currentUser: string,
  ): Promise<PostOutput[]> {
    try {
      return await this.getPosts(pageNumber, currentUser, PostLimit.Profile);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPostsNewFeed(
    pageNumber: number,
    currentUser: string,
  ): Promise<PostOutput[]> {
    try {
      return await this.getPosts(pageNumber, currentUser);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPosts(
    pageNumber: number,
    currentUser: string,
    option?: PostLimit,
    groupId?: string,
  ): Promise<PostOutput[]> {
    const limit = POSTS_PER_PAGE;
    const skip =
      !pageNumber || pageNumber < 0 ? 0 : pageNumber * POSTS_PER_PAGE;
    const followings = await this.followingsService.getFollowingIds(
      currentUser,
    );
    followings.push(currentUser);
    const userObjectIds = followings.map((i) => Types.ObjectId(i));
    let match = {};
    switch (option) {
      case PostLimit.Group:
        match = { group: Types.ObjectId(groupId) };
        break;
      case PostLimit.Profile:
        match = {
        user: Types.ObjectId(currentUser),
        group: { $exists: false },
      };
      break;
    case PostLimit.NewsFeed:
    default:
      match = {
        $or: [
          { user: { $in: userObjectIds }, group: { $exists: false } },
          { user: Types.ObjectId(currentUser), group: { $exists: true } },
        ],
      };
    }
    const posts = await this.postModel
      .find(match)
      .populate('user', ['_id', 'displayName', 'avatar'])
      .populate('group', ['_id', 'name', 'backgroundImage'])
      .select(['-mediaFiles._id'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const result = posts.map((post) => {
      const postId = (post as any)._id;
      const createdAt = this.stringHandlersHelper.getDateWithTimezone(
        String((post as any).createdAt),
        VIET_NAM_TZ,
      );
      const user = post.user as any;
      const reactions = this.getReactions(post.reactions);
      const groupId = (post.group as any)?._id;
      const groupName = (post.group as unknown as GroupDocument)?.name;
      const groupBackgroundImage = (post.group as unknown as GroupDocument)
        ?.backgroundImage;
      return {
        postId: postId,
        groupId: groupId?.toString(),
        groupBackgroundImage: groupBackgroundImage,
        groupName: groupName,
        userId: user._id,
        userDisplayName: user.displayName,
        userAvatar: user.avatar,
        description: post.description,
        files: post.mediaFiles,
        reactions: reactions,
        comments: post.comments,
        isCurrentUser: user._id.toString() === currentUser,
        createdAt: createdAt,
      };
    });
    return result;
  }

  public async searchPosts(userId: string, search: string, pageNumber: number) {
    try {
      if (!search) return [];
      const limit = POSTS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * limit;
      search = search.trim();
      const hashtagsInsearch =
        this.stringHandlersHelper.getHashtagFromString(search);
      let rmwp = search.split(' ').join('');
      hashtagsInsearch.forEach((ht) => {
        rmwp = rmwp.replace(ht, '');
      });
      if (hashtagsInsearch?.length > 0 && rmwp.length === 0) {
        return this.searchPostByHashtags(hashtagsInsearch, limit, skip);
      } else {
        const posts = await this.postModel
          // .find({ description: { $regex: search } },)
          .find({ $text: { $search: search } })
          .sort([['date', 1]])
          .select(['-__v'])
          .skip(skip)
          .limit(limit);
        return {
          searchResults: posts.length,
          posts,
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async searchPostByHashtags(
    hashtagsArr: string[],
    limit: number,
    skip: number,
  ) {
    try {
      if (hashtagsArr?.length === 1) {
        const hashtagInfo = await this.hashtagsService.getHashtag(
          hashtagsArr[0],
        );
        if (hashtagInfo) {
          const postByHashtag = await this.postModel
            .find({
              hashtags: hashtagsArr[0],
            })
            .sort([['date', 1]])
            .select(['-__v'])
            .skip(skip)
            .limit(limit);
          return {
            hashtagInfo,
            postByHashtag,
          };
        }
      } else {
        const postByHashtags = await this.postModel
          .find({
            hashtags: { $all: hashtagsArr },
          })
          .sort([['date', 1]])
          .select(['-__v'])
          .skip(skip)
          .limit(limit);
        return {
          searchReults: postByHashtags.length,
          postByHashtags,
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  private getReactions(reactions: Reactions): Reactions {
    const reactionsArr = Object.entries<number>(reactions).sort((el1, el2) => {
      return Number(el2[1]) - Number(el1[1]);
    });
    let total = 0;
    for (const key in reactions) total += reactions[key];
    const result: Reactions = Object.fromEntries<number>(
      reactionsArr.slice(0, 3).filter((i) => Number(i[1]) > 0),
    );
    result.total = total;
    return result;
  }
  public async getTrending(currentUser: string): Promise<PostOutput[]> {
    try {
      const posts: PostDocument[] = await this.postModel.aggregate([
        {
          $addFields: {
            total: {
              $sum: [
                '$reactions.loves',
                '$reactions.likes',
                '$reactions.hahas',
                '$reactions.wows',
                '$reactions.sads',
                '$reactions.angrys',
              ],
            },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { user: 'user' },
            pipeline: [{ $project: { _id: 1, displayName: 1, avatar: 1 } }],
            as: 'user',
          },
        },
        { $match: { group: { $exists: false } } },
        {
          $project: {
            user: { $arrayElemAt: ['$user', 0] },
            description: 1,
            mediaFiles: 1,
            reactions: 1,
            comments: 1,
            createdAt: 1,
          },
        },

        { $limit: TRENDING_LENGTH },
      ]);
   
      const result = posts.map((post) => {
        const postId = (post as any)._id;
        const createdAt = this.stringHandlersHelper.getDateWithTimezone(
          String((post as any).createdAt),
          VIET_NAM_TZ,
        );
        const user = post.user as any;
        const reactions = this.getReactions(post.reactions);
        return {
          postId: postId,
          userId: user._id,
          userDisplayName: user.displayName,
          userAvatar: user.avatar,
          description: post.description,
          files: post.mediaFiles,
          reactions: reactions,
          comments: post.comments,
          isCurrentUser: user._id.toString() === currentUser,
          createdAt: createdAt,
        };
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
