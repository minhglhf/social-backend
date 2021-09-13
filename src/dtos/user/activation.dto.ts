import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ActivationInput {
  @ApiProperty({ type: String, required: true })
  @IsString()
  email: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  activationCode: string;
}
export class SendActivationCodeInput {
  @ApiProperty({ type: String, required: true })
  @IsString()
  email: string;
}
