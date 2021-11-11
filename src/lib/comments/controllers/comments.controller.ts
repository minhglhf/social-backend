import { Controller, Get, UseGuards, Request, Post, Query, Delete, Body, Put, Param } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentsService } from '../providers/comments.service';

@Controller('comment')
@ApiTags('Comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()

export class CommentsController {
  constructor(private commentService: CommentsService) { }

  @Post('/add')
  @ApiOperation({
    description: 'thêm comment mới'
  })
  @ApiQuery({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post cần comment'
  })
  @ApiQuery({
    name: 'parentId',
    type: String,
    description: 'id của comment cha',
    required: false
  })
  @ApiQuery({
    name: 'comment',
    type: String,
    description: 'nội dung'
  })
  async addComment(@Request() req, @Query('postId') postId: string, @Query('parentId') parentId: string, @Query('comment') comment: string) {
    const userId = req.user.userId.toString();
    return this.commentService.addComment(userId, postId, parentId, comment);
  }

  @Post('/delete/:id')
  @ApiOperation({
    description: 'Xoa comment'
  })
  @ApiQuery({
    type: String,
    name: 'commentId',
    required: true,
    description: 'id của comment cần xoa'
  })
  async deleteComment(@Request() req, @Query('commentId') commentId: string) {
    const userId = req.user.userId.toString();
    return this.commentService.deleteComment(userId, commentId);
  }

}
