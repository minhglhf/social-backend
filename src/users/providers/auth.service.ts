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
@Injectable()
export class UsersAuthService {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private usersHelper: UsersHelper,
    @InjectModel(Activation.name)
    private activationModel: Model<ActivationDocument>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
  ) {}
  public async signUp(input: UserSignUp): Promise<void> {
    if (await this.usersService.findUserByMail(input.email)) {
      throw new ConflictException('Email already exists');
    }
    const salt = await bcrypt.genSalt();
    input.password = await bcrypt.hash(input.password, salt);
    await this.usersService.addNewUser(input);
  }
  public async login(payload: JwtPayLoad): Promise<LoginOutput> {
    if (!payload.isActive) {
      throw new ForbiddenException('Account not activated');
    }
    const user = await this.usersService.getUserProfile(
      payload.userId.toHexString(),
    );
    const accessToken = await this.authService.generateAcessToken(payload);
    return { ...accessToken, ...user };
  }
  public async sendActivationCode(email: string): Promise<void> {
    try {
      const user = await this.usersService.findUserByMail(email);
      if (!user) throw new BadRequestException('email dose not exist');
      if (user.isActive)
        throw new BadRequestException('The account has been activated');
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const activationCode = this.usersHelper.generateString(10);
      const expireIn = dayjs().tz(VIET_NAM_TZ).add(10, 'day').format();

      await this.activationModel.findOneAndUpdate(
        { email: email },
        { activationCode: activationCode, expireIn: new Date(expireIn) },
        { upsert: true },
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
      if (promises[1].isActive)
        throw new BadRequestException('The account has been activated ');
      if (
        !activation ||
        !(activation.activationCode === activationInput.activationCode)
      ) {
        throw new BadRequestException('Activation failed');
      }
      const now = dayjs().tz(VIET_NAM_TZ);
      const expireDate = dayjs(activation.expireIn).tz(VIET_NAM_TZ);

      if (now.diff(expireDate) >= 0) {
        throw new BadRequestException('Activation failed');
      }
      await this.usersService.activateAccount(activationInput.email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async sendVerificationCode(email: string): Promise<void> {
    try {
      const user = await this.usersService.findUserByMail(email);
      if (!user) throw new BadRequestException('email dose not exist');
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const activationCode = this.usersHelper.generateString(10);
      const expireIn = dayjs().tz(VIET_NAM_TZ).add(1, 'm').format();

      await this.passwordResetModel.findOneAndUpdate(
        { email: email },
        { verificationCode: activationCode, expireIn: new Date(expireIn) },
        { upsert: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
