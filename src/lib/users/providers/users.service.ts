import {
  BadGatewayException,
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
        address: { province: -1, district: -1, ward: -1 },
        birthday: new Date(user.birthday),
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
      const user = await this.userModel
        .findById(userId)
        .populate('address.province', ['name'], Province.name)
        .populate('address.district', ['name'], District.name)
        .populate('address.ward', ['name'], Ward.name);
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
  public async updateInfo(
    userId: string,
    userInfoInput: UserInfoInput,
  ): Promise<void> {
    if (!userInfoInput) return;
    try {
      const birthday = userInfoInput.birthday;
      const address = userInfoInput.address;
      if (birthday) {
        await this.userModel.findByIdAndUpdate(userId, {
          birthday: new Date(birthday),
        });
      }
      if (address) {
        if (address.province > 0) {
          if (
            !(await this.addressesService.isValidProvince(address.province))
          ) {
            throw new BadRequestException('Invalid province');
          }
          if (address.district > 0) {
            if (
              !(await this.addressesService.isValidDistrict(
                address.district,
                address.province,
              ))
            ) {
              throw new BadRequestException('Invalid district');
            }
            if (address.ward > 0) {
              if (
                !(await this.addressesService.isValidWard(
                  address.ward,
                  address.province,
                  address.district,
                ))
              )
                throw new BadRequestException('Invalid ward');
              await this.userModel.findByIdAndUpdate(userId, {
                address: {
                  province: address.province,
                  district: address.district,
                  ward: address.ward,
                },
              });
            } else {
              await this.userModel.findByIdAndUpdate(userId, {
                address: {
                  province: address.province,
                  district: address.district,
                  ward: -1,
                },
              });
            }
          } else {
            await this.userModel.findByIdAndUpdate(userId, {
              address: {
                province: address.province,
                district: -1,
                ward: -1,
              },
            });
          }
        } else {
          await this.userModel.findByIdAndUpdate(userId, {
            address: {
              province: -1,
              district: -1,
              ward: -1,
            },
          });
        }
      }
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
}
