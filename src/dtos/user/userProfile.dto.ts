import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
} from 'class-validator';
import { AddressInput } from '../address/address.dto';
import { Express } from 'express';
export class UserInfoInput {
  @ApiProperty({ type: String, required: false })
  @IsDateString()
  birthday: string;
  @ApiProperty({ type: AddressInput, required: false })
  @IsObject()
  address: AddressInput;
}

export class UserProfile {
  email: string;
  displayName: string;
  birthday: Date;
  avatar: string;
  coverPhoto: string;
  address: {
    province: string;
    district: string;
    ward: string;
  };
}
export class ProfileImageInput {
  @ApiProperty({ type: 'file', required: false })
  avatar: Express.Multer.File;
  @ApiProperty({ type: 'file', required: false })
  coverPhoto: Express.Multer.File;
}
export class ProfileImageOutPut {
  avatar: string;
  coverPhoto: string;
}
