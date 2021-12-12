import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SearchTypes } from 'src/utils/enums';
import { SearchService } from '../providers/search.service';

@ApiTags('Search All')
@ApiBearerAuth()
@Controller('searchAll')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Tìm kiếm anything' })
  @ApiQuery({
    type: String,
    name: 'search',
    description:
      'Nhập chuỗi tìm kiếm, chuỗi có thể bao gồm nhiều hashtag và string',
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    description:
      'Nhập số tự nhiên bắt đầu từ 0 tương ứng từng page, nếu nhập page <= 0 thì auto là page đầu tiên',
  })
  @ApiQuery({
    type: String,
    enum: SearchTypes,
    name: 'searchType',
    required: true,
    description: 'type of react',
  })
  async searchUsers(
    @Query('search') search: string,
    @Query('page', ParseIntPipe) pageNumber,
    @Query('searchType') searchType: string = SearchTypes.All,
    @Request() req,
  ) {
    return this.searchService.searchAll(
      req.user.userId,
      search,
      pageNumber,
      searchType,
    );
  }
}
