import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile } from 'src/dtos/user/userProfile.dto';
import { UserSignUp } from 'src/dtos/user/userSignup.dto';
import { User, UserDocument } from 'src/entities/user.entity';
import { UsersHelper } from 'src/helpers/users.helper';
import * as bcrypt from 'bcrypt';
import { ChangePasswordInput } from 'src/dtos/user/changePassword.dto';
import { isBuffer } from 'util';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersHelper: UsersHelper,
  ) {}
  public async findUserByMail(email: string): Promise<UserDocument> {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addNewUser(user: UserSignUp): Promise<void> {
    try {
      const newUser: Partial<UserDocument> = {
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        address: '',
        birthday: null,
        isActive: false,
        avatar: '',
        coverPhoto: '',
      };
      await new this.userModel(newUser).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await this.userModel.findById(userId);
      return this.usersHelper.mapToUserProfile(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async activateAccount(email: string): Promise<void> {
    try {
      await this.userModel.findOneAndUpdate(
        { email: email },
        { isActive: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async changePassword(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(newPassword, salt);
      await this.userModel.findByIdAndUpdate(userId, { password: hash });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateNewPassword(
    userId: string,
    changePasswordInput: ChangePasswordInput,
  ): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (user) {
        if (
          !(await bcrypt.compare(
            changePasswordInput.currentPassword,
            user.password,
          ))
        )
          throw new BadRequestException('Mật khẩu hiên tại không đúng');
      }
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(changePasswordInput.newPassword, salt);
      await this.userModel.findByIdAndUpdate(userId, { password: hash });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
