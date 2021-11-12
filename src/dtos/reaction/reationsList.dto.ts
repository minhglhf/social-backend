import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ReactionDocument } from 'src/entities/reaction.entity';

export class UserReaction {
  userId: String
  displayName: String
  avatar: String
  isFollowed: Boolean
  reaction: String
}
