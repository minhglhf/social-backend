import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { AddressInput, AddressOutput } from '../address/address.dto';
import { Express } from 'express';
import { Type } from 'class-transformer';
export class UserInfoInput {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Ngày tháng năm sinh theo dạng DateString, bắt buộc',
  })
  @IsDateString()
  birthday: string;
  @ApiProperty({
    type: AddressInput,
    required: false,
    description:
      'input để cập nhật địa chỉ, bắt buộc phải có, phải truyền đầy đủ cả 3 trường',
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressInput)
  address: AddressInput;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Giới tính 0: nữ, 1: nam, 2: khác',
  })
  @IsInt()
  @IsIn([0, 1, 2])
  sex: number;
}

export class UserProfile {
  email: string;
  displayName: string;
  birthday: string;
  avatar: string;
  coverPhoto: string;
  address: {
    province: AddressOutput;
    district: AddressOutput;
    ward: AddressOutput;
  };
  sex: string;
  followers: number;
  followings: number;
  isCurrentUser: boolean;
  createdAt: string;
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
