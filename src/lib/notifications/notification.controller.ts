import { Body, Controller, Post, UseGuards, Request, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { SendChat } from "src/dtos/chat/sendChat.dto";
import { ConversationService } from "../conversation/conversation.service";
import { NotificationService } from "./notification.service";

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('noti')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private notificationService: NotificationService
    ) { }

    // @Post('sendNotifi')
    // @UseGuards(JwtAuthGuard)
    // @ApiOperation({
    //     description: 'test notifi with friend',
    // })
    // @ApiQuery({
    //     type: String,
    //     required: true,
    //     name: 'friendId',
    //     description: 'Id cua friend',
    // })
    // @ApiQuery({
    //     type: String,
    //     required: true,
    //     name: 'action',
    //     description: 'some action',
    // })
    // @ApiQuery({
    //     type: String,
    //     required: true,
    //     name: 'typeOfPost',
    //     description: 'not important',
    // })
    // async sendNoti(@Request() req, @Query('friendId') friendId: string, @Query('action') action: string, @Query('typeOfPost') type: string) {
    //     const yourId = req.user.userId.toString();
    //     return this.notificationService.saveToNotifiList(yourId, friendId, action, type);
    // }

    @Get('getNotificationList')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'getNotifications ',
    })
    async getNoti(@Request() req) {
        const yourId = req.user.userId.toString();
        return this.notificationService.getNotifilist(yourId);
    }
}