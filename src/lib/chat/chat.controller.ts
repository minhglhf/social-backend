import { Body, Controller, Post, UseGuards, Request, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { SendChat } from "src/dtos/chat/sendChat.dto";
import { ConversationService } from "../conversation/conversation.service";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./gateway/chat.gateway";

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private alertGateway: ChatGateway,
        private chatService: ChatService,
        private conversationService: ConversationService
    ) { }

    @Post('chatTo')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'chat with friend',
    })
    @ApiBody({
        type: SendChat,
    })
    async chat(@Request() req, @Body() sendChat: SendChat) {
        const yourId = req.user.userId.toString();
        return this.chatService.sendChat(yourId, sendChat.received, sendChat.content);
    }

    @Get('/getConversation')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'getConversation',
    })
    @ApiQuery({
        type: String,
        required: true,
        name: 'converId',
        description: 'Id cua conversation',
    })
    async getConver(@Request() req, @Query('converId') converId: string) {
        return this.conversationService.getConversation(converId);
    }

}