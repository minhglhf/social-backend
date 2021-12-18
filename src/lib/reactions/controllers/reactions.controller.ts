import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Query,
  Delete,
  Body,
  Put,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { time } from 'console';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReactionType, ReactionTypeQuery, Time } from 'src/utils/enums';
import { ReactionsService } from '../providers/reactions.service';

@Controller('reaction')
@ApiTags('Reaction')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReactionsController {
  constructor(private reactionsSerivce: ReactionsService) {}
  @Get('/statistic')
  @ApiOperation({
    description: 'Thống kê reactions trong profile theo thời gian',
  })
  @ApiQuery({
    type: String,
    name: 'userId',
    description:
      'id của user muốn lấy thống kê, nếu là user hiện tại thì không cần truyền',
    required: false,
  })
  @ApiQuery({ type: String, enum: Time, name: 'time' })
  async getReactionsSatistic(
    @Query('time') time: string,
    @Query('userId') userId: string,
    @Request() req,
  ) {
    if (!userId) userId = req.user.userId;
    return this.reactionsSerivce.getReactionStatisticByTime(userId, time);
  }
  @Post('/addReactionToPost')
  @ApiOperation({
    description: 'thêm reaction mới',
  })
  @ApiQuery({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post',
  })
  @ApiQuery({
    name: 'reaction',
    type: String,
    enum: ReactionType,
    description: 'reaction type',
    required: true,
  })
  async addReaction(
    @Request() req,
    @Query('postId') postId: string,
    @Query('reaction') reaction: ReactionType = ReactionType.Like,
  ) {
    const userId = req.user.userId.toString();
    return this.reactionsSerivce.addReactionToPost(userId, postId, reaction);
  }

  @Get('/:postId')
  @ApiOperation({
    description: 'thêm reaction mới',
  })
  @ApiQuery({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post',
  })
  @ApiQuery({
    type: String,
    enum: ReactionTypeQuery,
    name: 'reactType',
    required: true,
    description: 'type of react',
  })
  @ApiQuery({
    type: Number,
    name: 'pageNumber',
    required: false,
    description: 'page number',
  })
  async getReactionsOfPost(
    @Request() req,
    @Query('postId') postId: string,
    @Query('reactType') reactType: string = ReactionTypeQuery.All,
    @Query('pageNumber') pageNumber: number,
  ) {
    const userId = req.user.userId.toString();
    return this.reactionsSerivce.getReactionsOfPost(
      userId,
      postId,
      reactType,
      pageNumber,
    );
  }
  @Delete('/deleteReaction')
  @ApiOperation({
    description: 'xoa reaction',
  })
  @ApiQuery({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post',
  })
  async deleteReactionOfPost(@Request() req, @Query('postId') postId: string) {
    const userId = req.user.userId.toString();
    return this.reactionsSerivce.deleteReaction(userId, postId);
  }
}
