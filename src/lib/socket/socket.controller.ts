import { Body, Controller, Post, UseGuards, Request, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { SendChat } from "src/dtos/chat/sendChat.dto";
import { ConversationService } from "../conversation/conversation.service";

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('sendNoti')
@UseGuards(JwtAuthGuard)
export class SocketController {
    constructor(

    ) { }
}