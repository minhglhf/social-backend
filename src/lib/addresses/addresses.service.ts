import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressInput } from 'src/dtos/address/address.dto';
import { District, DistrictDocument } from 'src/entities/district.entity';
import { Province, ProvinceDocument } from 'src/entities/province.entity';
import { Ward, WardDocument } from 'src/entities/ward.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Province.name) private provinceModel: Model<ProvinceDocument>,
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    @InjectModel(Ward.name) private wardModel: Model<WardDocument>,
  ) {}
  public async getProvinces(): Promise<ProvinceDocument[]> {
    try {
      return await this.provinceModel.find({}).sort({ name: 1 });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getDistricts(provinceId: number): Promise<DistrictDocument[]> {
    try {
      return await this.districtModel
        .find({ province: provinceId })
        .sort({ name: 1 });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getWards(districtId: number): Promise<WardDocument[]> {
    try {
      return await this.wardModel
        .find({ district: districtId })
        .sort({ name: 1 });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async isValidProvince(provinceId: number): Promise<boolean> {
    try {
      return (await this.provinceModel.findOne({ _id: provinceId }))
        ? true
        : false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async isValidDistrict(
    districtId: number,
    provinceId: number,
  ): Promise<boolean> {
    try {
      const district = await this.districtModel.findOne({
        _id: districtId,
        province: provinceId,
      });

      return (await this.districtModel.findOne({
        _id: districtId,
        province: provinceId,
      }))
        ? true
        : false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async isValidWard(
    wardId: number,
    provinceId: number,
    districtId: number,
  ): Promise<boolean> {
    try {
      return (await this.wardModel.findOne({
        _id: wardId,
        province: provinceId,
        district: districtId,
      }))
        ? true
        : false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async isValidAddress(address: AddressInput): Promise<boolean> {
    if (address.province > 0) {
      if (!(await this.isValidProvince(address.province))) {
        return false;
      }
      if (address.district > 0) {
        if (!(await this.isValidDistrict(address.district, address.province))) {
          return false;
        }
        if (address.ward > 0) {
          if (
            !(await this.isValidWard(
              address.ward,
              address.province,
              address.district,
            ))
          )
            return false;
        }
      } else {
        if (address.ward > 0) return false;
      }
    } else {
      if (address.district > 0) {
        return false;
      }
    }
    return true;
  }
}
