import { UserProfile } from 'src/dtos/user/userProfile.dto';
import { UserDocument } from 'src/entities/user.entity';

export class UsersHelper {
  public mapToUserProfile(user: UserDocument): UserProfile {
    return {
      email: user.email,
      displayName: user.displayName,
      birthday: user.birthday,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      address: user.address,
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
}
