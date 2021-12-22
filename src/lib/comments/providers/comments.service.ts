import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StatisticOutPut } from 'src/dtos/statistic/statistic.dto';
import { Comment, CommentDocument } from 'src/entities/comment.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { PostsService } from 'src/lib/posts/providers/posts.service';
import { FOLLOWINGS_PER_PAGE, VIET_NAM_TZ } from 'src/utils/constants';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private postService: PostsService,
  ) { }
  public async addComment(userId, postId, comment): Promise<Comment> {
    try {
      const checkPost = await this.postService.getPost(postId);
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại');
      }
      if (comment) {
        const updateCommentCount = {
          $inc: {
            comments: 1,
          },
        };
        await this.postService.updatePostCommentAndReactionCount(
          postId,
          updateCommentCount,
        );
        const addComment = new this.commentModel({
          postId: Types.ObjectId(postId),
          userId: Types.ObjectId(userId),
          parentId: null,
          comment,
          replys: 0,
        });
        return await addComment.save();
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async addReplyToComment(userId, commentId, comment): Promise<Comment> {
    try {
      const cmt = await this.commentModel.findById(commentId);
      if (!cmt) throw new BadRequestException('Comment không tồn tại');
      if (comment) {
        await this.commentModel.findByIdAndUpdate(commentId, {
          $inc: {
            replys: 1,
          },
        });
        const updateCommentCount = {
          $inc: {
            comments: 1,
          },
        };
        await this.postService.updatePostCommentAndReactionCount(
          cmt.postId.toString(),
          updateCommentCount,
        );
        const addComment = new this.commentModel({
          postId: Types.ObjectId(cmt.postId.toString()),
          userId: Types.ObjectId(userId),
          parentId: Types.ObjectId(commentId),
          comment,
          replys: 0,
        });
        return await addComment.save();
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async deleteComment(userId, commentId): Promise<void> {
    try {
      const cmt = await this.commentModel.findById(commentId);
      if (!cmt) throw new BadRequestException('Comment không tồn tại');
      const checkIfMyComment = await this.commentModel.findOne({
        userId: Types.ObjectId(userId),
      });
      console.log(checkIfMyComment);
      if (!checkIfMyComment)
        throw new BadRequestException(
          'bạn không có quyền xóa comment không phải của bạn',
        );
      const updateCommentCount = {
        $inc: {
          comments: -1,
        },
      };
      await this.postService.updatePostCommentAndReactionCount(
        cmt.postId.toString(),
        updateCommentCount,
      );
      if (cmt.parentId != null) {
        await this.commentModel.findByIdAndUpdate(cmt.parentId, {
          $inc: {
            replys: -1,
          },
        });
      }
      await this.commentModel.findByIdAndDelete(commentId);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getListCommentParent(userId, postId, pageNumber): Promise<any> {
    try {
      const perPage = FOLLOWINGS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const post = await this.postService.getPost(postId);
      if (!post) throw new BadRequestException('Post không tồn tại');
      const commentParent = await this.commentModel
        .find({
          postId: Types.ObjectId(postId),
          parentId: null,
        })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-__v'])
        .skip(skip)
        .limit(perPage);
      return commentParent;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getListCommentReply(
    userId,
    commentId,
    pageNumber,
  ): Promise<any> {
    try {
      const perPage = FOLLOWINGS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const cmt = await this.commentModel.findById(commentId);
      if (!cmt) throw new BadRequestException('Comment không tồn tại');
      const commentReply = await this.commentModel
        .find({
          parentId: Types.ObjectId(commentId),
        })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-__v'])
        .skip(skip)
        .limit(perPage);
      return commentReply;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async getCommentsStatisticByTime(
    userId: string,
    time: string,
  ): Promise<StatisticOutPut[]> {
    try {
      const range = this.stringHandlersHelper.getStartAndEndDateWithTime(time);
      const postsToSearch = (
        await this.postService.getPostIdsInProfile(userId)
      ).map((postId) => Types.ObjectId(postId));
      const reactionsStatistic = await this.commentModel.aggregate([
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
