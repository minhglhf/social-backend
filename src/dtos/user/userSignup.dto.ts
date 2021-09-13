import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserSignUp {
  @ApiProperty({ type: String, required: true, description: 'User email' })
  @IsString()
  email: string;
  @ApiProperty({ type: String, required: true, description: 'User password' })
  password: string;
  @ApiProperty({ type: String, required: true, description: 'Tên hiển thị' })
  @IsString()
  displayName: string;
}
