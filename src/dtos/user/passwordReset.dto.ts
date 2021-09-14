import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class PasswordResetInput {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  newPassword: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  token: string;
}
