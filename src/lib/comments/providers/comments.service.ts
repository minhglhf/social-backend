import {
  BadRequestException,
  Injectable, InternalServerErrorException, Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from 'src/entities/comment.entity';
import { PostsService } from 'src/lib/posts/providers/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private postService: PostsService
  ) { }
  public async addComment(userId, postId, parentId, comment): Promise<Comment> {
    try {
      const checkPost = await this.postService.getPost(postId)
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại')
      }
      if (comment) {
        if (parentId) {
          const checkParent = await this.commentModel.findById(String(parentId))
          if (!checkParent) throw new BadRequestException('Comment cha không tồn tại')
        }
        const updateCommentCount = {
          $inc: {
            comments: 1,
          }
        }
        await this.postService.updatePostCommentAndReactionCount(postId, updateCommentCount)
        const addComment = new this.commentModel({
          postId: Types.ObjectId(postId),
          userId: Types.ObjectId(userId),
          parentId: parentId ? Types.ObjectId(parentId) : null,
          comment
        })
        return await addComment.save()
      }
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  public async deleteComment(userId, commentId): Promise<void> {
    try {
      const checkCmt = await this.commentModel.findById(commentId)
      if (!checkCmt) throw new BadRequestException('Comment không tồn tại')
      const checkIfMyComment = await this.commentModel.findOne({ userId: Types.ObjectId(userId) })
      console.log(checkIfMyComment)
      if (!checkIfMyComment) throw new BadRequestException('bạn không có quyền xóa comment không phải của bạn')
      const updateCommentCount = {
        $inc: {
          comments: -1,
        },
        // $min: {
        //   comments: 0
        // }
      }
      await this.postService.updatePostCommentAndReactionCount(checkCmt.postId.toString(), updateCommentCount)
      await this.commentModel.findByIdAndDelete(commentId)
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }
}
