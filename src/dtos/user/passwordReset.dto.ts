import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class PasswordResetInput {
  @ApiProperty({ type: String, required: true })
  @IsEmail()
  email: string;
  @ApiProperty({ type: String, required: true })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/, {
    message: 'Invalid password',
  })
  newPassword: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  token: string;
}
