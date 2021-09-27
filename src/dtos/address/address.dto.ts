import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  Min,
  NotEquals,
} from 'class-validator';

export class AddressInput {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của tỉnh/thành phố, truyền từ -1 nếu không có',
    default: -1,
  })
  @IsInt()
  @Min(-1)
  @NotEquals(0)
  province: number;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của quận/huyện, truyền -1 nếu không có',
    default: -1,
  })
  @IsInt()
  @Min(-1)
  @NotEquals(0)
  district: number;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'id của xã/phường/thị trấn, truyền -1 nếu không có ',
    default: -1,
  })
  @IsInt()
  @Min(-1)
  @NotEquals(0)
  ward: number;
}
export class AddressOutput {
  _id: number;
  name: string;
}
