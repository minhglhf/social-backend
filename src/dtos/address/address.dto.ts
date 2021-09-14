import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddressInput {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của tỉnh/thành phố',
  })
  @IsNumber()
  province: number;
  @ApiProperty({
    type: Number,
    required: false,
    description: 'id của quận/huyền',
  })
  @IsNumber()
  district: number;
  @ApiProperty({
    type: Number,
    required: false,
    description: 'id của xã/phường/thị trấn',
  })
  @IsNumber()
  ward: number;
}
