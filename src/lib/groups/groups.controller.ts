import { Controller, Get, UseGuards, Request, Post, Query, Delete, Body, Put, Param, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddMemberInput } from 'src/dtos/group/addMember.dto';
import { NewGroupInput } from 'src/dtos/group/createGroup.dto';
import { imageFileFilter, storage } from 'src/helpers/storage.helper';
import { Privacy } from 'src/utils/enums';
import { GroupsService } from './groups.service';

@Controller('groups')
@ApiTags('Groups')
@ApiBearerAuth()
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

    @Post('/create')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'tạo group mới'
    })
    @ApiConsumes('multipart/form-data')
    // @ApiBody({ type: NewGroupInput })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                groupName: { type: 'string' },
                privacy: { type: 'string', enum: [Privacy.Public, Privacy.Private] },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: imageFileFilter,
        storage: storage
    }))

    async createGroup(
        @Request() req,
        @Body() groupNewInput: NewGroupInput,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (req.fileValidationError) {
            throw new BadRequestException(
                'invalid file provided, [image files allowed]',
            );
        }
        const adminId = req.user.userId.toString();
        return this.groupsService.create(adminId, groupNewInput.groupName, groupNewInput.privacy, file);
    }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'lấy danh sách groups đã join',
  })
  async getGroup(@Request() req) {
    const yourId = req.user.userId.toString();
    return this.groupsService.getGroups(yourId);
  }

  @Get('/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'xem chi tiết group',
  })
  @ApiParam({
    type: String,
    required: true,
    name: 'groupId',
    description: 'Id của group',
  })
  async getGroupById(@Request() req, @Param('groupId') grId: string) {
    const yourId = req.user.userId.toString();
    return this.groupsService.getGroupById(yourId, grId);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'xóa group',
  })
  @ApiQuery({
    type: String,
    name: 'groupId',
    description: 'xóa group',
    required: true,
  })
  async deleteGroup(@Query('groupId') groupId: string) {
    return this.groupsService.deleteGroup(groupId);
  }

  @Put('addMember')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'thêm thành viên',
  })
  @ApiBody({
    type: AddMemberInput,
  })
  async addMember(@Request() req, @Body() addMemberInput: AddMemberInput) {
    const yourId = req.user.userId.toString();
    return this.groupsService.addMember(yourId, addMemberInput);
  }
}
