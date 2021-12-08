import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { FileType } from 'src/entities/post.entity';

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
  files: FileType[];
  description: string;
  reactions: {
    [reactionType: string]: number;
  };
  comments: number;
  isCurrentUser: boolean;
  createdAt: string;
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
