import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFile, MediaFileSchema } from 'src/entities/mediaFile.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsModule } from 'src/uploads/uploads.module';
import { GroupsModule } from '../groups/groups.module';
import { PostsModule } from '../posts/posts.module';
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
    forwardRef(() => GroupsModule),
  ],
  controllers: [MediaFilesController],
  providers: [MediaFilesService, StringHandlersHelper, MapsHelper],
  exports: [MediaFilesService],
})
export class MediaFilesModule {}
