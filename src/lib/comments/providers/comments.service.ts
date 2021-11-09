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
        await this.postService.updatePostCommentCount(postId, updateCommentCount)
        const addComment = new this.commentModel({
          postId: Types.ObjectId(postId),
          userId: Types.ObjectId(userId),
          parentId: parentId ? Types.ObjectId(parentId) : null,
          comment
        })
        return addComment.save()
      }
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }
}
