import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FollowingsOutput } from 'src/dtos/following/following.dto';
import { User, UserDocument } from 'src/entities/user.entity';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { FOLLOWs_SUGGESTION_LENGTH } from 'src/utils/constants';
import { LocationType } from 'src/utils/enums';

@Injectable()
export class UsersAddressService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private followingsService: FollowingsService,
  ) {}
  public async getUsersWithAddress(
    locationType: LocationType,
    locationId: number,
    currentUser: string,
    skip: number,
    limit: number,
  ): Promise<UserDocument[]> {
    try {
      const followings = await this.followingsService.getFollowingIds(
        currentUser,
      );
      followings.push(currentUser);
      const ignoreUsers = followings.map((i) => Types.ObjectId(i));
      let match;
      switch (locationType) {
        case LocationType.Province:
          match = {
          'address.province': locationId,
          _id: { $nin: ignoreUsers },
        };
          break;
        case LocationType.District:
          match = {
            'address.district': locationId,
            _id: { $nin: ignoreUsers },
          };
          break;
        case LocationType.Ward:
          match = { 'address.ward': locationId, _id: { $nin: ignoreUsers } };
          break;
        default:
          return [];
      }
      const result = await this.usersModel
        .find(match)
        .select(['displayName', 'avatar'])
        .skip(skip)
        .limit(limit);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getNearestUsers(
    currentUser: string,
  ): Promise<Partial<UserDocument>[]> {
    try {
      const { province, district, ward } = (
        await this.usersModel.findById(currentUser)
      ).address;

      let result = [];
      if (province > 0 && district > 0 && ward > 0) {
        result = await this.getUsersWithAddress(
          LocationType.Ward,
          ward,
          currentUser,
          0,
          FOLLOWs_SUGGESTION_LENGTH,
        );
        if (result.length >= FOLLOWs_SUGGESTION_LENGTH) return result;
      }
      if (
        (province > 0 && district > 0 && ward < 0) ||
        result.length < FOLLOWs_SUGGESTION_LENGTH
      ) {
        const size = result.length;
        result = result.concat(
          await this.getUsersWithAddress(
            LocationType.District,
            district,
            currentUser,
            size,
            FOLLOWs_SUGGESTION_LENGTH - size,
          ),
        );
        if (result.length >= FOLLOWs_SUGGESTION_LENGTH) return result;
      }
      if (
        (province > 0 && district < 0 && ward < 0) ||
        result.length < FOLLOWs_SUGGESTION_LENGTH
      ) {
        const size = result.length;
        result = result.concat(
          await this.getUsersWithAddress(
            LocationType.Province,
            province,
            currentUser,
            size,
            FOLLOWs_SUGGESTION_LENGTH - size,
          ),
        );
        return result;
      }
      return [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
