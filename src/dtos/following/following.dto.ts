import { ApiProperty } from '@nestjs/swagger';

export class FollowingInput {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Id của người muốn bỏ theo dõi hoặc muốn theo dõi',
  })
  followingId: string;
}

export class FollowingsOutput {
  followingId: string;
  displayName: string;
  avatar: string;
}

export class FollowersOutput {
  followerId: string;
  displayName: string;
  avatar: string;
  followed: boolean;
}
