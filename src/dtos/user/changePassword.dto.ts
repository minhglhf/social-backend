import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/utils/constants';

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
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid password',
  })
  newPassword: string;
}
