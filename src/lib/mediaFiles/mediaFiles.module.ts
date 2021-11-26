import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFile, MediaFileSchema } from 'src/entities/mediaFile.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsModule } from 'src/uploads/uploads.module';
import { MediaFilesController } from './mediaFiles.controller';
import { MediaFilesService } from './mediaFiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MediaFile.name,
        schema: MediaFileSchema,
      },
    ]),
    UploadsModule,
  ],
  controllers: [MediaFilesController],
  providers: [MediaFilesService, StringHandlersHelper],
  exports: [MediaFilesService],
})
export class MediaFilesModule {}
