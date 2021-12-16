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
import * as bcrypt from 'bcrypt';
import { ChangePasswordInput } from 'src/dtos/user/changePassword.dto';
import { AddressesService } from 'src/lib/addresses/addresses.service';
import { Province } from 'src/entities/province.entity';
import { Ward } from 'src/entities/ward.entity';
import { District } from 'src/entities/district.entity';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { SEARCH_USER_PER_PAGE } from 'src/utils/constants';
import { FollowingsOutput } from 'src/dtos/following/following.dto';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { MediaFilesService } from 'src/lib/mediaFiles/mediaFiles.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private addressesService: AddressesService,
    private mapsHelper: MapsHelper,
    private stringHandlers: StringHandlersHelper,
    private mediaFilesService: MediaFilesService,
    private followingsService: FollowingsService,
  ) {}
  public async findUserById(id: string): Promise<UserDocument> {
    try {
      return await this.userModel.findById({ id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async findUserByManyId(
    listId: Types.ObjectId[],
  ): Promise<UserDocument[]> {
    try {
      return await this.userModel.find({
        _id: {
          $in: listId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
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
        displayNameNoAccent: this.stringHandlers.removeAccent(user.displayName),
        address: { province: -1, district: -1, ward: -1 },
        birthday: new Date(user.birthday),
        isActive: false,
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
      userId = userId.trim();
      const user = await this.userModel
        .findById(userId)
        .populate('address.province', ['_id', 'name'], Province.name)
        .populate('address.district', ['_id', 'name'], District.name)
        .populate('address.ward', ['_id', 'name'], Ward.name)
        .select(['-password', '-__v']);
      const checkFollowed = await this.followingsService.checkIfFollowed(
        currentUserId.toString(),
        userId,
      );
      return this.mapsHelper.mapToUserProfile(
        user,
        currentUserId === userId,
        checkFollowed !== null,
      );
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
      return this.mapsHelper.mapToUserProfile(user, true);
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
      const coverPhotoPath = `images/coverPhoto/${userId}${this.stringHandlers.generateString(
        15,
      )}`;
      const avatarPath = `images/avatar/${userId}${this.stringHandlers.generateString(
        15,
      )}`;
      if (!avatar && coverPhoto) {
        coverPhotoUrl = (
          await this.mediaFilesService.saveFile(
            coverPhoto,
            coverPhotoPath,
            'Ảnh bìa',
            userId.toString(),
          )
        ).url;
        await this.userModel.findByIdAndUpdate(
          userId,
          { coverPhoto: coverPhotoUrl },
          { upsert: true },
        );
      } else if (avatar && !coverPhoto) {
        avatarUrl = (
          await this.mediaFilesService.saveFile(
            avatar,
            avatarPath,
            'Ảnh đại diện',
            userId.toString(),
          )
        ).url;

        await this.userModel.findByIdAndUpdate(
          userId,
          { avatar: avatarUrl },
          { upsert: true },
        );
      } else if (avatar && coverPhoto) {
        const promises = await Promise.all([
          this.mediaFilesService.saveFile(
            coverPhoto,
            coverPhotoPath,
            'Ảnh bìa',
            userId.toString(),
          ),
          this.mediaFilesService.saveFile(
            avatar,
            avatarPath,
            'Ảnh đại diện',
            userId.toString(),
          ),
        ]);
        coverPhotoUrl = promises[0].url;
        avatarUrl = promises[1].url;
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
  public async getUserSearchList(
    userId: string,
    search: string,
    pageNumber: number,
  ): Promise<FollowingsOutput[]> {
    search = this.stringHandlers.removeAccent(search.trim());
    if (!search) return [];
    let limit = SEARCH_USER_PER_PAGE;
    let skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * limit;
    const globalRegex = new RegExp(
      '(^' + search + ')' + '|' + '( +' + search + '[a-zA-z]*' + ')',
      'i',
    );
    const followingIds = await this.followingsService.getFollowingIds(userId);
    let followings: UserDocument[] = [];
    if (skip < followingIds.length) {
      followings = await this.userModel
        .find({
          displayNameNoAccent: { $regex: globalRegex },
          _id: { $in: followingIds },
        })
        .sort({ displayNameNoAccent: 1 })
        .select(['displayName', 'avatar'])
        .skip(skip)
        .limit(limit);

      if (followings.length < limit) {
        skip = 0;
        limit = limit - followings.length;
      } else {
        return this.mapsHelper.mapToFollowingsOuput(
          followings,
          followingIds,
          userId,
        );
      }
    }
    const rest = await this.userModel
      .find({
        displayNameNoAccent: { $regex: globalRegex },
        _id: { $nin: followingIds },
      })
      .sort({ displayNameNoAccent: 1 })
      .select(['displayName', 'avatar'])
      .skip(skip)
      .limit(limit);
    const result = followings.concat(rest);
    return this.mapsHelper.mapToFollowingsOuput(result, followingIds, userId);
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
