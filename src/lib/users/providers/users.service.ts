import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProfileImageOutPut,
  UserInfoInput,
  UserProfile,
} from 'src/dtos/user/userProfile.dto';
import { UserSignUp } from 'src/dtos/user/userSignup.dto';
import { User, UserDocument } from 'src/entities/user.entity';
import { UsersHelper } from 'src/helpers/users.helper';
import * as bcrypt from 'bcrypt';
import { ChangePasswordInput } from 'src/dtos/user/changePassword.dto';
import { AddressesService } from 'src/lib/addresses/addresses.service';
import { Province } from 'src/entities/province.entity';
import { Ward } from 'src/entities/ward.entity';
import { District } from 'src/entities/district.entity';
import { UploadsService } from 'src/uploads/uploads.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private addressesService: AddressesService,
    private usersHelper: UsersHelper,
    private uploadsService: UploadsService,
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
        displayNameNoTone: this.usersHelper.removeTone(user.displayName),
        address: { province: -1, district: -1, ward: -1 },
        birthday: new Date(user.birthday),
        isActive: true,
        avatar: '',
        coverPhoto: '',
        sex: user.sex,
        followers: 0,
        followings: 0,
      };
      await new this.userModel(newUser).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserProfile(
    currentUserId: string,
    userId: string,
  ): Promise<UserProfile> {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('address.province', ['_id', 'name'], Province.name)
        .populate('address.district', ['_id', 'name'], District.name)
        .populate('address.ward', ['_id', 'name'], Ward.name);

      return this.usersHelper.mapToUserProfile(user, currentUserId === userId);
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
  public async updateInfo(
    userId: string,
    userInfoInput: UserInfoInput,
  ): Promise<UserProfile> {
    if (!userInfoInput) return;
    try {
      const sex = userInfoInput.sex;
      const birthday = userInfoInput.birthday;
      const address = userInfoInput.address;
      if (!(await this.addressesService.isValidAddress(userInfoInput.address)))
        throw new BadRequestException('This address is not available');
      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            birthday: new Date(birthday),
            address: address,
            sex: sex,
          },
          { new: true },
        )
        .populate('address.province', ['_id', 'name'], Province.name)
        .populate('address.district', ['_id', 'name'], District.name)
        .populate('address.ward', ['_id', 'name'], Ward.name);
      return this.usersHelper.mapToUserProfile(user, true);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateProfileImage(
    userId: Types.ObjectId,
    avatar: Express.Multer.File,
    coverPhoto: Express.Multer.File,
  ): Promise<ProfileImageOutPut> {
    try {
      let coverPhotoUrl = '';
      let avatarUrl = '';
      const coverPhotoPath = `images/coverPhoto/${userId}${this.usersHelper.generateString(
        15,
      )}`;
      const avatarPath = `images/avatar/${userId}${this.usersHelper.generateString(
        15,
      )}`;
      if (!avatar && coverPhoto) {
        const promises = await Promise.all([
          await this.uploadsService.uploadImageFile(coverPhoto, coverPhotoPath),
          await this.userModel.findByIdAndUpdate(
            userId,
            { coverPhoto: coverPhotoUrl },
            { upsert: true },
          ),
        ]);
        coverPhotoUrl = promises[0];
      } else if (avatar && !coverPhoto) {
        const promises = await Promise.all([
          this.uploadsService.uploadImageFile(avatar, avatarPath),
          this.userModel.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { upsert: true },
          ),
        ]);
        avatarUrl = promises[0];
      } else if (avatar && coverPhoto) {
        const promises = await Promise.all([
          this.uploadsService.uploadImageFile(coverPhoto, coverPhotoPath),
          this.uploadsService.uploadImageFile(avatar, avatarPath),
        ]);
        coverPhotoUrl = promises[0];
        avatarUrl = promises[1];
        await Promise.all([
          this.userModel.findByIdAndUpdate(
            userId,
            { coverPhoto: coverPhotoUrl },
            { upsert: true },
          ),
          this.userModel.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { upsert: true },
          ),
        ]);
      }
      return {
        avatar: avatarUrl,
        coverPhoto: coverPhotoUrl,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserSearchList(search: string): Promise<UserDocument[]> {
    const address = { province: 2, district: -1, ward: -1 };
    const globalRegex = new RegExp(
      '(^' + search + ')' + '|' + '( +' + search + '[a-zA-z]*' + ')',
      'i',
    );
    return await this.userModel
      .find({ displayNameNoTone: { $regex: globalRegex } })
      .sort({ displayNameNoTone: 1 });
  }
  public async updateFollowers(
    userId: Types.ObjectId,
    update: number,
  ): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { followers: update },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateFollowings(
    userId: Types.ObjectId,
    update: number,
  ): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { followings: update },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
