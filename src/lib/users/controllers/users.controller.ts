import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordInput } from 'src/dtos/user/changePassword.dto';
import {
  ProfileImageInput,
  UserInfoInput,
} from 'src/dtos/user/userProfile.dto';
import { imageFileFilter, storage } from 'src/helpers/storage.helper';
import { UsersService } from '../providers/users.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) { }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'Id của user muốn lấy profile, nếu muốn lấy thông tin của current user có thể ko truyền cũng được',
  })
  @ApiBearerAuth()
  @ApiOperation({ description: 'Lấy thông tin user' })
  async getUserProfile(@Request() req, @Query('userId') userId: string) {
    if (!userId) userId = req.user.userId.toString();
    return this.usersService.getUserProfile(req.user.userId, userId);
  }
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Đổi mật khẩu' })
  @ApiBody({ type: ChangePasswordInput })
  async changePassword(
    @Body() changePasswordInput: ChangePasswordInput,
    @Request() req,
  ) {
    return this.usersService.updateNewPassword(
      req.user.userId,
      changePasswordInput,
    );
  }
  @Put('update-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Cập nhật thông tin' })
  @ApiBody({ type: UserInfoInput })
  async updateInfo(@Body() userInfoInput: UserInfoInput, @Request() req) {
    return this.usersService.updateInfo(req.user.userId, userInfoInput);
  }
  @Post('upload/profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'coverPhoto', maxCount: 1 },
      ],
      {
        fileFilter: imageFileFilter,
        storage: storage,
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    description:
      'Cập nhật ảnh đại diện và ảnh bìa, nếu không truyền hoặc truyền null thì không cập nhật',
  })
  @ApiBody({ type: ProfileImageInput })
  uploadFile(
    @Request() req,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File;
      coverPhoto?: Express.Multer.File;
    },
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image files allowed]',
      );
    }

    return this.usersService.updateProfileImage(
      req.user.userId,
      files?.avatar ? files.avatar[0] : null,
      files?.coverPhoto ? files.coverPhoto[0] : null,
    );
  }
  @Get('search/users')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Tìm kiếm người dùng theo tên' })
  @ApiQuery({
    type: String,
    name: 'search',
    description: 'Nhập chuỗi tìm kiếm, nếu chuỗi rỗng sẽ không trả về gì',
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
    return this.usersService.getUserSearchList(
      req.user.userId,
      search,
      pageNumber,
    );
  }
}
