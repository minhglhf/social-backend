import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { url } from "inspector";
import { Model } from "mongoose";
import { MediaFileDto } from "src/dtos/mediaFile/mediaFile.dto";
import { MediaFile, MediaFileDocument } from "src/entities/mediaFile.entity";
import { UploadsService } from "src/uploads/uploads.service";

@Injectable()
export class MediaFilesService {
    constructor(@InjectModel(MediaFile.name) private fileModel: Model<MediaFileDocument>,
    private uploadsService: UploadsService,
    ){}
    public async saveFile(
        uploadFile: Express.Multer.File,
        path: string,
        des: string,
        userId: string,
        groupId?: string
    ): Promise<string>{
       try {
        const fileUrl = await this.uploadsService.uploadFile(uploadFile, path);
        const type = uploadFile.mimetype.split('/')[0];
        const newFile = {
            user: userId,
            group: groupId,
            type: type,
            des: des,
            url: fileUrl,
            groupId: groupId
        }
        if(!groupId) delete newFile.groupId;
        await new this.fileModel(newFile).save();
        return fileUrl;
       } catch (error) {
           throw new InternalServerErrorException(error);
       }
    }
    public async getFiles(userId: string, groupId?: string ): Promise<MediaFileDto[]> {
        const match = groupId? {userId, groupId} : {userId};
        const files = await this.fileModel.find(match);
        return files.map((file)=>{
            if(file.group) {
                return {
                    userId: file.user.toHexString(),
                    des: file.des,
                    url: file.url,
                    type: file.type,
                    groupId: file.group.toHexString(),
                };
            }
            return {
                userId: file.user.toHexString(),
                des: file.des,
                url: file.url,
                type: file.type,
            }; 
        })
    }

}