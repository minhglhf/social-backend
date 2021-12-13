import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from 'src/entities/group.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { MediaFilesModule } from '../mediaFiles/mediaFiles.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
    MediaFilesModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService, StringHandlersHelper],
  exports: [GroupsService],
})
export class GroupsModule {}
