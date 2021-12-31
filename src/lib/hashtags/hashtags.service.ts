import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashtagOutput } from 'src/dtos/hashtag/hashtag.dto';
import {
  HashtagByDate,
  HashtagByDateDocument,
} from 'src/entities/hashtagByDate.entity';
import { Hashtag, HashtagDocument } from 'src/entities/hastag.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { TRENDING_LENGTH } from 'src/utils/constants';
import { Time, TimeCheck } from 'src/utils/enums';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectModel(Hashtag.name) private hashtagModel: Model<HashtagDocument>,
    @InjectModel(HashtagByDate.name)
    private hashtagByDateModel: Model<HashtagByDateDocument>,
    private stringHandlersHelper: StringHandlersHelper,
  ) {}
  public async addHastags(hashtags: string[]): Promise<void> {
    try {
      const start = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(TimeCheck.Day)[0],
      );
      const end = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(TimeCheck.Day)[1],
      );
      if (!hashtags || hashtags == []) return;
      const promises = [];
      for (const ht of hashtags) {
        promises.push(
          this.hashtagModel.updateOne(
            { hashtag: ht },
            { hashtag: ht, $inc: { popular: 1 } },
            { upsert: true },
          ),
        );
        promises.push(
          this.hashtagByDateModel.updateOne(
            {
              hashtag: ht,
              createdAt: { $gte: start, $lte: end },
            },
            {
              hashtag: ht,
              $inc: { popularByDate: 1 },
            },
            {
              upsert: true,
            },
          ),
        );
      }
      await Promise.all(promises);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getPopularOfHashtag(hashtag: string): Promise<number> {
    try {
      const popular = (await this.hashtagModel.findOne({ hashtag: hashtag }))
        ?.popular;
      return popular ? popular : 0;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getHashtag(hashtag: string) {
    try {
      const hashtagInfo = await this.hashtagModel
        .findOne({ hashtag: hashtag })
        .select(['-__v']);
      return hashtagInfo;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async getTrendingHastags(time: string): Promise<HashtagOutput[]> {
    try {
      if (time == Time.All) {
        const hashtags = await this.hashtagModel
          .find({})
          .select(['hashtag', 'popular'])
          .sort({ popular: -1 })
          .limit(TRENDING_LENGTH);
        return hashtags.map((ht) => {
          return {
            popular: ht.popular,
            hashtag: ht.hashtag,
          };
        });
      }
      const start = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(time, true)[0],
      );
      const end = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(time, true)[1],
      );
      const hashtags: HashtagOutput[] = await this.hashtagByDateModel.aggregate(
        [
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: '$hashtag',
              popular: { $sum: '$popularByDate' },
              hashtag: { $first: '$hashtag' },
            },
          },
          {
            $project: {
              _id: 0,
              popular: 1,
              hashtag: 1,
            },
          },
          {
            $project: {
              hashtag: 1,
              popular: 1,
            },
          },
          {
            $sort: { popular: -1, hashtag: 1 },
          },
          {
            $limit: TRENDING_LENGTH,
          },
        ],
      );
      return hashtags;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
