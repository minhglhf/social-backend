import { FollowingsOutput } from 'src/dtos/following/following.dto';
import { UserProfile } from 'src/dtos/user/userProfile.dto';
import { DistrictDocument } from 'src/entities/district.entity';
import { FollowingDocument } from 'src/entities/following.entity';
import { ProvinceDocument } from 'src/entities/province.entity';
import { UserDocument } from 'src/entities/user.entity';
import { WardDocument } from 'src/entities/ward.entity';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { VIET_NAM_TZ } from 'src/utils/constants';
import { LoginOutput } from 'src/dtos/user/login.dto';
export class MapsHelper {
  public mapToLoginOutput(accessToken: string, user: UserProfile): LoginOutput {
    return {
      accessToken: accessToken,
      displayName: user.displayName,
      avatar: user.avatar,
      sex: user.sex,
    };
  }
  public mapToUserProfile(
    user: UserDocument,
    isCurrentUser: boolean,
  ): UserProfile {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    const province = user.address?.province as unknown as ProvinceDocument;
    const district = user.address?.district as unknown as DistrictDocument;
    const ward = user.address?.ward as unknown as WardDocument;
    const birthday = dayjs(user.birthday).tz(VIET_NAM_TZ).format('YYYY-MM-DD');
    const createdAt = dayjs((user as unknown as any).createdAt)
      .tz(VIET_NAM_TZ)
      .format('YYYY-MM-DD');
    let sex = '';
    switch (user.sex) {
      case 0:
        sex = 'Nữ';
        break;
      case 1:
        sex = 'Nam';
        break;
      case 2:
        sex = 'Khác';
        break;
      default:
      break;
    }
    return {
      email: user.email,
      displayName: user.displayName,
      birthday: birthday,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      address: {
        province: {
          _id: province ? province._id : -1,
          name: province ? province.name : '',
        },
        district: {
          _id: district ? district._id : -1,
          name: district ? district.name : '',
        },
        ward: { _id: ward ? ward._id : -1, name: ward ? ward.name : '' },
      },
      sex: sex,
      followers: user.followers,
      followings: user.followings,
      isCurrentUser: isCurrentUser,
      createdAt: createdAt,
    };
  }
  public mapToFollowingsOuput(
    followings: UserDocument[] | FollowingDocument[],
    followingIds: string[],
    currentUserId: string,
  ): FollowingsOutput[] {
    return followings.map((i) => {
      const user = (i.user ? i.user : i) as unknown as any;
      return {
        userId: user._id.toHexString(),
        displayName: user.displayName,
        avatar: user.avatar,
        followed: followingIds.includes(user._id.toString()),
        isCurrentUser: currentUserId === user._id.toString(),
      };
    });
  }
}
