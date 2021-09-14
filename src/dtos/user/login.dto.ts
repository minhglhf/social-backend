import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginInput {
  @ApiProperty({ type: String, required: true, description: 'User email' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: String, required: true, description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginOutput {
  accessToken: string;
  email: string;
  displayName: string;
  birthday: Date;
  avatar: string;
  coverPhoto: string;
  address: string;
}
