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
} from '@nestjs/common';
import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
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
  constructor(private postsService: PostsService) {}
  @Post('newpostprivate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Tạo Post cá nhân mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PostPrivateInput })
  @UseInterceptors(AnyFilesInterceptor({fileFilter: imageOrVideoFileFilter, storage: storage}))
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

  // @Get('newpostgroup')
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ description: 'Lấy danh sách các post cho newfeed' })
  // async getPostNewFeed(@Request() req){
  //   return this.postsService.getPostNewFeed(req.user.userId);
  // }
}
