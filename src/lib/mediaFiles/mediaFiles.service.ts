import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaFileDto } from 'src/dtos/mediaFile/mediaFile.dto';
import { MediaFile, MediaFileDocument } from 'src/entities/mediaFile.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsService } from 'src/uploads/uploads.service';
import { MEDIA_FILES_PER_PAGE, VIET_NAM_TZ } from 'src/utils/constants';
import { File } from 'src/utils/enums';
@Injectable()
export class MediaFilesService {
  constructor(
    @InjectModel(MediaFile.name) private fileModel: Model<MediaFileDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private uploadsService: UploadsService,
  ) {}
  public async saveFile(
    uploadFile: Express.Multer.File,
    path: string,
    des: string,
    userId: string,
    groupId?: string,
  ): Promise<string> {
    try {
      const fileUrl = await this.uploadsService.uploadFile(uploadFile, path);
      const type = uploadFile.mimetype.split('/')[0];
      const newFile = {
        user: userId,
        group: groupId,
        type: type,
        des: des,
        url: fileUrl,
        groupId: groupId,
      };
      if (!groupId) delete newFile.groupId;
      await new this.fileModel(newFile).save();
      return fileUrl;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFiles(
    type: string,
    userId: string,
    pageNumber: number,
    groupId?: string,
  ): Promise<MediaFileDto[]> {
    const limit = MEDIA_FILES_PER_PAGE;
    const skip =
      !pageNumber || pageNumber <= 0
        ? (pageNumber = 0)
        : pageNumber * MEDIA_FILES_PER_PAGE;
    const match = groupId
      ? { user: userId, group: groupId }
      : { user: userId, group: { $exists: false } };
    switch (type) {
      case File.Video:
        (match as any).type = File.Video;
        break;
      case File.Image:
        (match as any).type = File.Image;
        break;
      case File.All:
      default:
        (match as any).type = File.All;
        break;
    }
    const files = await this.fileModel
      .find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return files.map((file) => {
      const createdAt = this.stringHandlersHelper.getDateWithTimezone(
        String((file as any).createdAt),
        VIET_NAM_TZ,
      );
      if (file.group) {
        return {
          userId: file.user.toString(),
          des: file.des,
          url: file.url,
          type: file.type,
          createdAt: createdAt,
          groupId: file.group.toString(),
        };
      }
      return {
        userId: file.user.toString(),
        des: file.des,
        url: file.url,
        type: file.type,
        createdAt: createdAt,
      };
    });
  }
}
