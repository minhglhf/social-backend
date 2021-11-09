import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MediaFile, MediaFileSchema } from "src/entities/mediaFile.entity";
import { UploadsModule } from "src/uploads/uploads.module";
import { MediaFilesService } from "./mediaFiles.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: MediaFile.name,
                schema: MediaFileSchema
            }
        ]),
        UploadsModule,
    ],
    providers: [MediaFilesService],
    exports: [MediaFilesService],
})
export class MediaFilesModule {}