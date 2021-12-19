import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse,
} from '@nestjs/websockets';
import { InternalServerErrorException, Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/lib/users/providers/users.service';
import { User, UserDocument } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { TypeInformation } from 'src/utils/enums';
import { ConversationService } from 'src/lib/conversation/conversation.service';
import { ChatService } from '../chat.service';
import { Types } from 'mongoose';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private conversationService: ConversationService,
        private chatService: ChatService
    ) { }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    // @UseGuards(JwtAuthGuard)
    @SubscribeMessage('chatToServer')
    async handleMessage(client: Socket, payload: { sender: string, friendId: string, message: string, room: string }): Promise<void> {
        const conver: any = await this.chatService.sendChat(payload.sender, payload.friendId, payload.message)
        console.log(conver)
        this.server.to(payload.room).emit('chatToClient', payload);
        // return { event: 'msgToClient', data: payload }
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, room: string): void {
        console.log('client joinroom', client.id, room)
        client.join(room)
        client.emit('joinedRoom', room)
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, room: string): void {
        console.log('client left room', client.id, room)
        client.leave(room)
        client.emit('leftRoom', room)
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }


}