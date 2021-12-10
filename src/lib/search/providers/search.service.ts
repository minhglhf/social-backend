import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostPrivateOutput } from 'src/dtos/post/postNew.dto';
import { FileType, Post, PostDocument } from 'src/entities/post.entity';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
import { HashtagsService } from 'src/lib/hashtags/hashtags.service';
import { MediaFilesService } from 'src/lib/mediaFiles/mediaFiles.service';
import { PostsService } from 'src/lib/posts/providers/posts.service';
import { UsersService } from 'src/lib/users/providers/users.service';
import { POSTS_PER_PAGE, VIET_NAM_TZ } from 'src/utils/constants';
import { SearchTypes } from 'src/utils/enums';
@Injectable()
export class SearchService {
  constructor(
    // private stringHandlersHelper: StringHandlersHelper,
    // private filesService: MediaFilesService,
    // private followingsService: FollowingsService,
    // private hashtagsService: HashtagsService,
    private postService: PostsService,
    private userService: UsersService
  ) { }

  public async searchAll(userId: string, search: string, pageNumber: number, searchType: string) {
    try {
      if (!search) return [];
      search = search.trim();
      const promises = await Promise.all([
        this.userService.getUserSearchList(userId, search, pageNumber),
        this.postService.searchPosts(userId, search, pageNumber)
      ])
      const searchUsers = promises[0]
      const searchPosts = promises[1]
      const usersResults = {
        searchResults: searchUsers.length,
        searchUsers
      }
      const postsResult = searchPosts;
      switch (searchType) {
        case SearchTypes.Users: {
          return usersResults
        }
        case SearchTypes.Posts: {
          return postsResult
        }
        default: {
          return {
            usersResults,
            postsResult
          }
        }
      }
    }
    catch (err) {
      throw new InternalServerErrorException(err)
    }
  }
}
