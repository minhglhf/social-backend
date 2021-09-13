import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile } from 'src/dtos/user/userProfile.dto';
import { UserSignUp } from 'src/dtos/user/userSignup.dto';
import { User, UserDocument } from 'src/entities/user.entity';
import { UsersHelper } from 'src/helpers/users.helper';

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
      await new this.userModel({ ...user, isActive: false }).save();
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
}
