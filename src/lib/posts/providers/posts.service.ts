import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/entities/posts.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { UploadsService } from 'src/uploads/uploads.service';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private uploadsService: UploadsService,
  ) {}

  // new post
  public async createNewPostPrivate(
    userId: string,
    description: string,
    imageOrVideo: Express.Multer.File,
  ): Promise<void> {
    try {
      let fileUrl = '';
      if (description) {
        const filePath = `post/imageOrVideo/${userId}${this.stringHandlersHelper.generateString(
          15,
        )}`;
        const promise = await this.uploadsService.uploadImageFile(
          imageOrVideo,
          filePath,
        );
        if (promise) {
          fileUrl = promise[0];
        }
      }
      const newPost: Partial<PostDocument> = {
        user: Types.ObjectId(userId),
        description: description,
        imageOrVideo: fileUrl,
        hashtag: this.stringHandlersHelper.getHashtagFromString(description),
        userLike: ['-1'],
        userView: ['-1'],
        comment: ['-1'],
      };
      await new this.postModel(newPost).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createNewPostGroup(
    userId: string,
    groupId: Types.ObjectId,
    description: string,
    imageOrVideo: Express.Multer.File,
  ): Promise<void> {
    try {
      let fileUrl = '';
      if (description) {
        const filePath = `post/imageOrVideo/${userId}${this.stringHandlersHelper.generateString(
          15,
        )}`;
        const promise = await this.uploadsService.uploadImageFile(
          imageOrVideo,
          filePath,
        );
        if (promise) {
          fileUrl = promise[0];
        }
      }
      const newPost: Partial<PostDocument> = {
        user: Types.ObjectId(userId),
        group: Types.ObjectId(groupId),
        description: description,
        imageOrVideo: fileUrl,
        hashtag: this.stringHandlersHelper.getHashtagFromString(description),
        userLike: ['-1'],
        userView: ['-1'],
        comment: ['-1'],
      };
      await new this.postModel(newPost).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public getPostNewFeed(userId: string) {
    return this.postModel.find();
  }
}

