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
import { Types } from 'mongoose';
import { SocketService } from 'src/lib/socket/socket.service';
import { NotificationService } from '../notification.service';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private notificationService: NotificationService,
        private socketService: SocketService
    ) { }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    // @UseGuards(JwtAuthGuard)
    @SubscribeMessage('sendNotification')
    async handleMessage(client: Socket, payload: { yourId: string, targetId: string, action: string }): Promise<void> {
        // const conver: any = await this.chatService.sendChat(payload.sender, payload.friendId, payload.message)
        const socket = await this.socketService.getSocketId(payload.targetId)
        console.log(`${payload.targetId} send notification to ${client.id} with action ${payload.action}`)
        await this.notificationService.saveToNotifiList(payload.yourId, payload.targetId, payload.action)
        if (socket) this.server.to(socket.socketId).emit('recievedNotificationList', payload);
        // return { event: 'msgToClient', data: payload }
    }

    @SubscribeMessage('saveSocketId')
    async handleJoinRoom(client: Socket, userId: string): Promise<void> {
        console.log('client id save to db', client.id)
        client.emit('isSavedSocketId', client.id)
        await this.socketService.saveToSocketId(userId, client.id)
    }

    @SubscribeMessage('deleteSocketId')
    async handleLeaveRoom(client: Socket, userId: string): Promise<void> {
        console.log('client left room', client.id)
        client.emit('isDeletedSocketId', client.id)
        await this.socketService.deleteSocketId(userId)
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