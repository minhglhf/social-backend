import { Body, Controller, Post, UseGuards, Request, Query, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { SendChat } from "src/dtos/chat/sendChat.dto";
import { ConversationService } from "./conversation.service";

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ConversationController {
    constructor(
        private conversationService: ConversationService
    ) { }

    @Post('newConversation')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'chat with friend',
    })
    @ApiQuery({
        type: String,
        required: true,
        name: 'friendId',
        description: 'Id cua friend',
    })
    async createNewConver(@Request() req, @Query('friendId') friendId: string) {
        const yourId = req.user.userId.toString();
        const peoples = []
        peoples.push(Types.ObjectId(yourId))
        peoples.push(Types.ObjectId(friendId))
        return this.conversationService.createNewConversation(peoples);
    }

    @Get('/getConversationId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        description: 'getConversationId',
    })
    @ApiQuery({
        type: String,
        required: true,
        name: 'friendId',
        description: 'Id cua friend',
    })
    async getConver(@Request() req, @Query('friendId') friendId: string) {
        const yourId = req.user.userId.toString();
        const peoples = []
        peoples.push(Types.ObjectId(yourId))
        peoples.push(Types.ObjectId(friendId))
        return this.conversationService.getConversationId(peoples);
    }

}