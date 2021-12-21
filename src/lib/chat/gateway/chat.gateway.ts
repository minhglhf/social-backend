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
import { SocketService } from 'src/lib/socket/socket.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private conversationService: ConversationService,
        private chatService: ChatService,
        private socketService: SocketService
    ) { }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    // @UseGuards(JwtAuthGuard)
    @SubscribeMessage('chatToServer')
    async handleMessage(client: Socket, payload: { sender: string, friendId: string, message: string, room: string }): Promise<void> {
        await this.chatService.sendChat(payload.sender, payload.friendId, payload.message)
        const socket = await this.socketService.getSocketId(payload.friendId)
        console.log(`${client.id} send chat to ${socket.socketId}`)
        client.to(socket.socketId).emit('chatToClient', payload);
        // return { event: 'msgToClient', data: payload }
    }

    // @SubscribeMessage('joinRoom')
    // handleJoinRoom(client: Socket, room: string): void {
    //     console.log('client joinroom', client.id, room)
    //     client.join(room)
    //     client.emit('joinedRoom', room)
    // }

    // @SubscribeMessage('leaveRoom')
    // handleLeaveRoom(client: Socket, room: string): void {
    //     console.log('client left room', client.id, room)
    //     client.leave(room)
    //     client.emit('leftRoom', room)
    // }

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