import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class PostPrivateInput {
  @ApiProperty({ type: String, description: 'description nếu có' })
  @IsString()
  description: string;
  @ApiProperty({ type: ['file'], description: 'image/video nếu có' })
  mediaFiles: [Express.Multer.File];
}

export class PostPrivateOutput {
  postId: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string;
  files: string[];
  description: string;
  reactions: {
    [reactionType: string]: number;
  };
  comments: number;
  isCurrentUser: boolean;
  createdAt: String;
}

export class PostGroupInput {
  @ApiProperty({ type: Types.ObjectId, description: 'GroupID' })
  @IsNumber()
  groupId: Types.ObjectId;
  @ApiProperty({ type: String, description: 'description nếu có' })
  @IsString()
  description: string;
  @ApiProperty({ type: 'file', description: 'image/video nếu có' })
  imageOrVideo: Express.Multer.File;
}
