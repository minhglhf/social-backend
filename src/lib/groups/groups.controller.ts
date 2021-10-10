import { Controller, Get, UseGuards, Request, Post, Query, Delete, Body, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddMemberInput } from 'src/dtos/group/addMember.dto';
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
        const yourId = req.user.userId.toString();
        return this.groupsService.getGroups(yourId);
    }

    @Delete('delete')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'xóa group'
    })
    @ApiQuery({
        type: String,
        name: 'groupId',
        description: 'xóa group',
        required: true
    })
    async deleteGroup(@Query('groupId') groupId: string) {
        return this.groupsService.deleteGroup(groupId)
    }

    @Put('addMember')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'thêm thành viên'
    })
    @ApiBody({
        type: AddMemberInput,
    })
    async addMember(@Request() req, @Body() addMemberInput: AddMemberInput) {
        const yourId = req.user.userId.toString();
        return this.groupsService.addMember(yourId, addMemberInput)
    }
}