import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordResetInput {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  token: string;
}
