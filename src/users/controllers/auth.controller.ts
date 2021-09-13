import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import {
  ActivationInput,
  SendActivationCodeInput,
} from 'src/dtos/user/activation.dto';
import { LoginInput } from 'src/dtos/user/login.dto';
import { UserSignUp } from 'src/dtos/user/userSignup.dto';
import { JwtPayLoad } from 'src/utils/types';
import { UsersAuthService } from '../providers/auth.service';

@ApiTags('Auth')
@Controller('user/auth')
export class UsersAuthController {
  constructor(private usersAuthService: UsersAuthService) {}
  @Post('signup')
  @ApiOperation({ description: 'Đăng kí tài khoản mới' })
  @ApiBody({ type: UserSignUp })
  async signUp(@Body() userSignUp: UserSignUp) {
    return this.usersAuthService.signUp(userSignUp);
  }
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ description: 'Đăng nhập' })
  @ApiBody({ type: LoginInput })
  async login(@Request() req) {
    const payload = { userId: req.user._id, isActive: req.user.isActive };
    return this.usersAuthService.login(payload);
  }
  @Put('send/activationCode')
  @ApiOperation({ description: 'Gửi mã kích hoạt tài khoản vào mail' })
  @ApiBody({ type: SendActivationCodeInput })
  async sendActivationCode(
    @Body() sendActivationCode: SendActivationCodeInput,
  ) {
    return this.usersAuthService.sendActivationCode(sendActivationCode.email);
  }
  @Put('activate-account')
  @ApiOperation({ description: 'Kích hoạt tài khoản' })
  @ApiBody({ type: ActivationInput })
  async activateAccount(@Body() activationInput: ActivationInput) {
    return this.usersAuthService.activateAccount(activationInput);
  }
  @Put('send/verificationCode')
  @ApiOperation({ description: 'Gửi mã xác nhận để đổi mật khẩu vào mail' })
  @ApiBody({ type: SendActivationCodeInput })
  async sendVerificationCode(
    @Body() sendActivationCode: SendActivationCodeInput,
  ) {
    return this.usersAuthService.sendVerificationCode(sendActivationCode.email);
  }
}
