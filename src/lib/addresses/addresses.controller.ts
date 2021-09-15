import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';

@Controller('address')
@ApiTags('Address')
@ApiBearerAuth()
export class AddressesController {
  constructor(private addressesService: AddressesService) {}
  @Get('provinces')
  @ApiOperation({ description: 'Lấy danh sách các tỉnh/thành phố' })
  async getProvinces() {
    return this.addressesService.getProvinces();
  }
  @Get('districts/:provinceId')
  @ApiOperation({
    description: 'Lấy danh sách các quận/huyện trong tỉnh/thành phố',
  })
  @ApiParam({
    type: Number,
    required: true,
    name: 'provinceId',
    description: 'Id của tỉnh/thành phố muốn lấy danh sách quận huyện',
  })
  async getDistricts(@Param('provinceId') provinceId: number) {
    return this.addressesService.getDistricts(provinceId);
  }
  @Get('wards/:districtId')
  @ApiOperation({
    description: 'Lấy danh sách các xã/phường/thị trấn trong quận/huyện',
  })
  @ApiParam({
    type: Number,
    required: true,
    name: 'districtId',
    description: 'Id của quận/huyện muốn lấy danh sách xã/phường/thị trấn',
  })
  async getWards(@Param('districtId') districtId: number) {
    return this.addressesService.getWards(districtId);
  }
}
