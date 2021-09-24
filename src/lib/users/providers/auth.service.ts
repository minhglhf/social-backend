import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSignUp } from 'src/dtos/user/userSignup.dto';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { LoginOutput } from 'src/dtos/user/login.dto';
import { JwtPayLoad } from 'src/utils/types';
import { ActivationInput } from 'src/dtos/user/activation.dto';
import {
  PasswordReset,
  PasswordResetDocument,
} from 'src/entities/passwordReset.entity';
import { Activation, ActivationDocument } from 'src/entities/activation.entity';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { VIET_NAM_TZ } from 'src/utils/constants';
import { UsersHelper } from 'src/helpers/users.helper';
import { PasswordResetInput } from 'src/dtos/user/passwordReset.dto';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UsersAuthService {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private usersHelper: UsersHelper,
    private mailService: MailService,
    @InjectModel(Activation.name)
    private activationModel: Model<ActivationDocument>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
  ) {}
  public async signUp(input: UserSignUp): Promise<void> {
    if (await this.usersService.findUserByMail(input.email)) {
      throw new ConflictException('Email đã tồn tại');
    }
    const salt = await bcrypt.genSalt();
    input.password = await bcrypt.hash(input.password, salt);
    await this.usersService.addNewUser(input);
    await this.sendActivationCode(input.email);
  }
  public async login(payload: JwtPayLoad): Promise<LoginOutput> {
    if (!payload.isActive) {
      throw new ForbiddenException('Tài khoản chưa được kích hoạt');
    }
    const user = await this.usersService.getUserProfile(
      payload.userId.toHexString(),
    );
    const accessToken = await this.authService.generateAcessToken(payload);
    return { ...accessToken, ...user };
  }
  public async sendActivationCode(email: string): Promise<void> {
    const user = await this.usersService.findUserByMail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt');
    }
    try {
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const activationCode = this.usersHelper.generateString(10);
      const expireIn = dayjs().tz(VIET_NAM_TZ).add(10, 'day').format();
      await this.activationModel.findOneAndUpdate(
        { email: email },
        { activationCode: activationCode, expireIn: new Date(expireIn) },
        { upsert: true },
      );
      await this.mailService.sendConfirmationEmail(
        email,
        activationCode,
        user.displayName,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async activateAccount(
    activationInput: ActivationInput,
  ): Promise<void> {
    try {
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const promises = await Promise.all([
        this.activationModel.findOne({
          email: activationInput.email,
        }),
        this.usersService.findUserByMail(activationInput.email),
      ]);
      const activation = promises[0];
      if (!promises[1]) throw new BadRequestException('Không tồn tại email');
      if (promises[1].isActive)
        throw new BadRequestException('Tài khoản đã được kích hoạt');
      if (
        !activation ||
        !(activation.activationCode === activationInput.activationCode)
      ) {
        throw new BadRequestException('Kích hoạt thất bại');
      }
      const now = dayjs().tz(VIET_NAM_TZ);
      const expireDate = dayjs(activation.expireIn).tz(VIET_NAM_TZ);

      if (now.diff(expireDate) >= 0) {
        throw new BadRequestException('Kích hoạt thất bại');
      }
      await this.usersService.activateAccount(activationInput.email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async sendResetLink(email: string): Promise<void> {
    const user = await this.usersService.findUserByMail(email);
    if (!user) throw new BadRequestException('Email không tồn tại');
    try {
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const token = this.usersHelper.generateString(60);
      const expireIn = dayjs().tz(VIET_NAM_TZ).add(1, 'm').format();

      await this.passwordResetModel.findOneAndUpdate(
        { email: email },
        { token: token, expireIn: new Date(expireIn) },
        { upsert: true },
      );
      await this.mailService.sendPasswordResetEmail(
        email,
        token,
        user.displayName,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async resetPassword(input: PasswordResetInput): Promise<void> {
    try {
      const promises = await Promise.all([
        this.usersService.findUserByMail(input.email),
        this.passwordResetModel.findOne({ email: input.email }),
      ]);
      const user = promises[0];
      if (!user) throw new BadRequestException('Email không tồn tại');
      if (!user.isActive)
        throw new BadRequestException('Tài khoản chưa được kích hoạt');

      const passwordReset = promises[1];
      if (!passwordReset || !(input.token === passwordReset.token))
        throw new BadRequestException('Đặt lại mật khẩu thất bại');
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const now = dayjs().tz(VIET_NAM_TZ);
      const expireDate = dayjs(passwordReset.expireIn).tz(VIET_NAM_TZ);
      if (now.diff(expireDate) >= 0) {
        throw new BadRequestException('Đặt lại mật khẩu thất bại');
      }
      await Promise.all([
        this.usersService.changePassword((user as any)._id, input.newPassword),
        this.passwordResetModel.findByIdAndDelete((passwordReset as any)._id),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
