import { Body, Controller, Post, UseGuards, Request, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { SendChat } from "src/dtos/chat/sendChat.dto";
import { ConversationService } from "../conversation/conversation.service";
import { ChatGateway } from "./gateway/notification.gateway";
import { NotificationService } from "./notification.service";

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('noti')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private notificationService: NotificationService
    ) { }

    @Post('getNotificationList')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'getNotifications ',
    })
    async chat(@Request() req, @Body() sendChat: SendChat) {
        const yourId = req.user.userId.toString();
        return this.notificationService.getNotifilist(yourId);
    }
}