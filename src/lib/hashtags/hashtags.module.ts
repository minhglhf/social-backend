import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HashtagByDate, HashtagByDateSchema } from 'src/entities/hashtagByDate.entity';
import { Hashtag, HashtagSchema } from 'src/entities/hastag.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { HashtagsService } from './hashtags.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Hashtag.name,
        schema: HashtagSchema,
      },
      {
        name: HashtagByDate.name,
        schema: HashtagByDateSchema,
      },
    ]),
  ],
  providers: [HashtagsService, StringHandlersHelper],
  exports: [HashtagsService],
})
export class HashtagsModule {}
