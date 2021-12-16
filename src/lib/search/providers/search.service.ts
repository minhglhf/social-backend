import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GroupsService } from 'src/lib/groups/groups.service';
import { PostsService } from 'src/lib/posts/providers/posts.service';
import { UsersService } from 'src/lib/users/providers/users.service';
import { SearchTypes } from 'src/utils/enums';
@Injectable()
export class SearchService {
  constructor(
    // private stringHandlersHelper: StringHandlersHelper,
    // private filesService: MediaFilesService,
    // private followingsService: FollowingsService,
    // private hashtagsService: HashtagsService,
    private postService: PostsService,
    private userService: UsersService,
    private groupService: GroupsService
  ) { }

  public async searchAll(
    userId: string,
    search: string,
    pageNumber: number,
    searchType: string,
  ) {
    try {
      if (!search) return [];
      search = search.trim();
      const promises = await Promise.all([
        this.userService.getUserSearchList(userId, search, pageNumber),
        this.postService.searchPosts(userId, search, pageNumber),
        this.groupService.searchGroups(userId, search, pageNumber)
      ]);
      const searchUsers = promises[0];
      const searchPosts = promises[1];
      const searchGroups = promises[2]
      const usersResults = {
        searchResults: searchUsers.length,
        searchUsers,
      };
      const postsResult = searchPosts;
      switch (searchType) {
        case SearchTypes.Users: {
          return usersResults;
        }
        case SearchTypes.Posts: {
          return postsResult;
        }
        case SearchTypes.Groups: {
          return searchGroups;
        }
        default: {
          return {
            usersResults,
            postsResult,
            searchGroups
          };
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
