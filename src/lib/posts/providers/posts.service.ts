import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/entities/post.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { HashtagsService } from 'src/lib/hashtags/hashtags.service';
import { MediaFilesService } from 'src/lib/mediaFiles/mediaFiles.service';
import { UploadsService } from 'src/uploads/uploads.service';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private filesService: MediaFilesService,
    private hashtagsService: HashtagsService,
  ) {}

  // new post
  public async createNewPostPrivate(
    userId: string,
    description: string,
    imageOrVideos: Express.Multer.File[],
  ): Promise<void> {
    try {
      if(!userId) userId = "1234"
      const fileUrlPromises = []
      console.log(imageOrVideos[0]);
      for(const item of imageOrVideos) {
        const filePath = `post/imageOrVideos/${userId}${this.stringHandlersHelper.generateString(
          15,
        )}`;
        const promise = this.filesService.saveFile(
          item,
          filePath,
          description,
          userId
        );
        fileUrlPromises.push(promise)
      }
      const fileUrls = await Promise.all(fileUrlPromises)
      const hashtags = this.stringHandlersHelper.getHashtagFromString(description);
      const newPost: Partial<PostDocument> = {
        user: Types.ObjectId(userId),
        description: description,
        mediaFiles: fileUrls,
        hashtags: this.stringHandlersHelper.getHashtagFromString(description),
        reactions: 0,
        comments: 0
      };
      await Promise.all([
        new this.postModel(newPost).save(),
        this.hashtagsService.addHastags(hashtags)
      ])
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // public async createNewPostGroup(
  //   userId: string,
  //   groupId: Types.ObjectId,
  //   description: string,
  //   imageOrVideo: Express.Multer.File,
  // ): Promise<void> {
  //   try {
  //     let fileUrl = '';
  //     if (description) {
  //       const filePath = `post/imageOrVideo/${userId}${this.stringHandlersHelper.generateString(
  //         15,
  //       )}`;
  //       const promise = await this.uploadsService.uploadImageFile(
  //         imageOrVideo,
  //         filePath,
  //       );
  //       if (promise) {
  //         fileUrl = promise[0];
  //       }
  //     }
  //     const newPost: Partial<PostDocument> = {
  //       user: Types.ObjectId(userId),
  //       group: Types.ObjectId(groupId.toString()),
  //       description: description,
  //       imageOrVideo: fileUrl,
  //       hashtag: this.stringHandlersHelper.getHashtagFromString(description),
  //       userLike: ['-1'],
  //       userView: ['-1'],
  //       comment: ['-1'],
  //     };
  //     await new this.postModel(newPost).save();
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  public getPostNewFeed(userId: string) {
    return this.postModel.find();
  }
}

