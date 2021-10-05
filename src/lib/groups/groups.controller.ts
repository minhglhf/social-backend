import { Controller, Get, UseGuards, Request, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Privacy } from 'src/utils/enums';
import { GroupsService } from './groups.service';

@Controller('groups')
@ApiTags('Groups')
@ApiBearerAuth()

export class GroupsController {
    constructor(private groupsService: GroupsService) { }

    @Post('/create')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'tạo group mới'
    })
    @ApiQuery({
        type: String,
        name: 'name',
        required: true,
        description: 'Đặt Tên Group'
    })
    @ApiQuery({
        name: 'privacy',
        enum: Privacy,
        description: 'Chọn quyền riêng tư của groups'
    })
    async createGroup(@Request() req, @Query('name') name: String, @Query('privacy') privacy: Privacy = Privacy.Public) {
        const adminId = req.user.userId.toString();
        return this.groupsService.create(adminId, name, privacy);
    }

    @Get('/')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'lấy danh sách groups đã join'
    })
    async getGroup(@Request() req) {
        return this.groupsService.getGroups();
    }

}