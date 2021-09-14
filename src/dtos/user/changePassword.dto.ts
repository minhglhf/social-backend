import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordInput {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Mật khẩu hiện tại',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
  @ApiProperty({
    type: String,
    required: true,
    description: 'Mật khẩu mới',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
