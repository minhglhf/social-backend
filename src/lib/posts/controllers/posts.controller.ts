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
  Logger,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express/multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostGroupInput, PostPrivateInput } from 'src/dtos/post/postNew.dto';
import { imageOrVideoFileFilter, storage } from 'src/helpers/storage.helper';
import { PostsService } from '../providers/posts.service';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
export class PostsController {
  constructor(private postsService: PostsService) { }
  @Post('newpostprivate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Tạo Post cá nhân mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PostPrivateInput })
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: imageOrVideoFileFilter,
      storage: storage,
    }),
  )
  async createNewPostPrivate(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() postPrivateInput: PostPrivateInput,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image or video files allowed]',
      );
    }

    return this.postsService.createNewPostPrivate(
      req.user.userId,
      postPrivateInput.description,
      files,
    );
  }

  // @Post('newpostgroup')
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ description: 'Tạo Post trong nhóm ' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ type: PostGroupInput })
  // @UseInterceptors(
  //   FileFieldsInterceptor([{ name: 'imageOrVideo', maxCount: 1 }], {
  //     fileFilter: imageOrVideoFileFilter,
  //     storage: storage,
  //   }),
  // )
  // async createNewPostGroup(
  //   @Request() req,
  //   @UploadedFiles()
  //   files: {
  //     imageOrVideo?: Express.Multer.File;
  //   },
  //   @Body() postGroupInput: PostGroupInput,
  // ) {
  //   if (req.fileValidationError) {
  //     throw new BadRequestException(
  //       'invalid file provided, [image or video files allowed]',
  //     );
  //   }

  //   return this.postsService.createNewPostGroup(
  //     req.user.userId,
  //     postGroupInput.groupId,
  //     postGroupInput.description,
  //     files?.imageOrVideo ? files.imageOrVideo[0] : null,
  //   );
  // }

  @Get('posts/in/newfeed')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    type: Number,
    name: 'pageNumber',
    required: false,
    description: 'Số trang 0, 1, 2... Nếu <=0 hoặc ko truyền thì lấy trang 0',
  })
  @ApiOperation({ description: 'Lấy danh sách các post cho newfeed' })
  async getPostsNewFeed(
    @Request() req,
    @Query('pageNumber') pageNumber: number,
  ) {
    return this.postsService.getPostsNewFeed(pageNumber, req.user.userId);
  }
  // @UseGuards(JwtAuthGuard)
  // @ApiQuery({
  //   type: Number,
  //   name: 'pageNumber',
  //   required: false,
  //   description: 'Số trang 0, 1, 2... Nếu <=0 hoặc ko truyền thì lấy trang 0',
  // })
  // @ApiOperation({ description: 'Lấy danh sách các post cho newfeed' })
  // async getPostsProfile(
  //   @Request() req,
  //   @Query('pageNumber') pageNumber: number,
  // ) {
  //   return this.postsService.getPostsProfile
  // }

  @Get('search/posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Tìm kiếm post' })
  @ApiQuery({
    type: String,
    name: 'search',
    description: 'Nhập chuỗi tìm kiếm, chuỗi có thể bao gồm nhiều hashtag và string',
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    description:
      'Nhập số tự nhiên bắt đầu từ 0 tương ứng từng page, nếu nhập page <= 0 thì auto là page đầu tiên',
  })
  async searchUsers(
    @Query('search') search: string,
    @Query('page', ParseIntPipe) pageNumber,
    @Request() req,
  ) {
    return this.postsService.searchPosts(
      req.user.userId,
      search,
      pageNumber,
    );
  }
}
