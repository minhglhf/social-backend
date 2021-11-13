import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hashtag, HashtagDocument } from 'src/entities/hastag.entity';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectModel(Hashtag.name) private hashtagModel: Model<HashtagDocument>,
  ) {}
  public async addHastags(hashtags: string[]): Promise<void> {
    try {
      if (!hashtags || hashtags == []) return;
      const promises = [];
      for (const ht of hashtags) {
        promises.push(
          this.hashtagModel.updateMany(
            { hashtag: ht },
            { hashtag: ht, $inc: { popular: 1 } },
            { upsert: true },
          ),
        );
      }
      await Promise.all(promises);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // public async getHashtags(match: string): Promise<>
}
