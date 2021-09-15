import { Controller, Get, UseGuards, Request, Put, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordInput } from 'src/dtos/user/changePassword.dto';
import { UserInfoInput } from 'src/dtos/user/userProfile.dto';
import { UsersService } from '../providers/users.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ description: 'Lấy thông tin user' })
  async getUserProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.userId);
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
}
