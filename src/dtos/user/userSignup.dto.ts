import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  isNotEmpty,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from 'src/utils/constants';

export class UserSignUp {
  @ApiProperty({ type: String, required: true, description: 'User email' })
  @IsEmail()
  email: string;
  @ApiProperty({ type: String, required: true, description: 'User password' })
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid password',
  })
  password: string;
  @ApiProperty({ type: String, required: true, description: 'Tên hiển thị' })
  @IsNotEmpty()
  displayName: string;
  @ApiProperty({ type: String, required: true, description: 'Ngày sinh' })
  @IsDateString()
  @IsNotEmpty()
  birthday: string;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Giới tính 0: nữ, 1: nam, 2: khác',
  })
  @IsInt()
  @IsIn([0, 1, 2])
  sex: number;
}
