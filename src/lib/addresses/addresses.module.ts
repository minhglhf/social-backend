import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { District, DistrictSchema } from 'src/entities/district.entity';
import { Province, ProvinceSchema } from 'src/entities/province.entity';
import { Ward, WardSchema } from 'src/entities/ward.entity';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Province.name,
        schema: ProvinceSchema,
      },
      {
        name: District.name,
        schema: DistrictSchema,
      },
      {
        name: Ward.name,
        schema: WardSchema,
      },
    ]),
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
