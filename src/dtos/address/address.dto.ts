import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddressInput {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của tỉnh/thành phố',
    default: -1,
  })
  @IsNumber()
  province: number;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của quận/huyền',
    default: -1,
  })
  @IsNumber()
  district: number;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của xã/phường/thị trấn',
    default: -1,
  })
  @IsNumber()
  ward: number;
}
