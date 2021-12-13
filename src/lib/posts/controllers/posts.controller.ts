import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostInput } from 'src/dtos/post/postNew.dto';
import { imageOrVideoFileFilter, storage } from 'src/helpers/storage.helper';
import { PostLimit } from 'src/utils/enums';
import { PostsService } from '../providers/posts.service';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}
  @Post('newpostprivate')
  @ApiOperation({ description: 'Tạo Post trong group lẫn cá nhân' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PostInput })
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: imageOrVideoFileFilter,
      storage: storage,
    }),
  )
  async createNewPostPrivate(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() postPrivateInput: PostInput,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image or video files allowed]',
      );
    }

    return this.postsService.createNewPost(
      req.user.userId,
      postPrivateInput.description,
      files,
      postPrivateInput.groupId,
    );
  }

  @Get('posts')
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'postLimit',
    enum: PostLimit,
    description: 'Chọn phạm vi post: group, profile, newsfeed',
    required: true,
  })
  @ApiQuery({
    type: String,
    name: 'groupId',
    required: false,
    description: 'Nếu chọn phạm vi là post thì thêm groupId',
  })
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'id của user muốn lấy post, nếu trong trang cá nhân của mình thì không cần truyền cũng đc',
  })
  @ApiOperation({ description: 'Lấy post trong trang cá nhân' })
  async getPosts(
    @Query('page') pageNumber: number,
    @Query('postLimit') postLimit: PostLimit,
    @Query('groupId') groupId: string,
    @Query('userId') userId: string,
    @Request() req,
  ) {
    if (userId) {
      if (postLimit !== PostLimit.Profile) return;
    } else userId = req.user.userId;
    return this.postsService.getPostsWithLimit(
      pageNumber,
      userId,
      postLimit,
      groupId,
    );
  }
  @Get('trending')
  @ApiOperation({
    description: 'các post có nhiều react nhất, mặc định lấy 20 post',
  })
  async getTrending(@Request() req) {
    return this.postsService.getTrending(req.user.userId);
  }
}
