import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserSignUp {
  @ApiProperty({ type: String, required: true, description: 'User email' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: String, required: true, description: 'User password' })
  password: string;
  @ApiProperty({ type: String, required: true, description: 'Tên hiển thị' })
  @IsString()
  @IsNotEmpty()
  displayName: string;
}
