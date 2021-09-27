import { UserProfile } from 'src/dtos/user/userProfile.dto';
import { DistrictDocument } from 'src/entities/district.entity';
import { ProvinceDocument } from 'src/entities/province.entity';
import { UserDocument } from 'src/entities/user.entity';
import { WardDocument } from 'src/entities/ward.entity';

export class UsersHelper {
  public mapToUserProfile(
    user: UserDocument,
    isCurrentUser: boolean,
  ): UserProfile {
    const province = user.address?.province as unknown as ProvinceDocument;
    const district = user.address?.district as unknown as DistrictDocument;
    const ward = user.address?.ward as unknown as WardDocument;
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
      birthday: user.birthday,
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
    };
  }
  public generateString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  public removeTone(alias: string) {
    let str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      ' ',
    );
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    return str;
  }
}
