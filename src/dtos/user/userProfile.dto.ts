import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNotEmptyObject, IsObject } from 'class-validator';
import { AddressInput } from '../address/address.dto';

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
