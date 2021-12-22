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
        private socketService: SocketService,
    ) { }

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    // @UseGuards(JwtAuthGuard)
    @SubscribeMessage('sendNotification')
    async handleMessage(client: Socket, payload: { yourId: string, targetId: string, action: string, typeOfPost: string, timeDoAction: string, postId: string }): Promise<void> {
        // const conver: any = await this.chatService.sendChat(payload.sender, payload.friendId, payload.message)
        const userDoAction = await this.socketService.getSocketId(payload.yourId)
        const socket = await this.socketService.getSocketId(payload.targetId)
        console.log(`${payload.targetId} send notification to ${client.id} with action ${payload.action}`)
        // console.log(userInfoInSocketTable)
        await this.notificationService.saveToNotifiList(payload.yourId, payload.targetId, payload.action, payload.typeOfPost)
        if (socket) client.to(socket.socketId).emit('recievedNotificationList', { payload, userDoAction: userDoAction.userId, timeDoAction: payload.timeDoAction, postId: payload.postId });
        // return { event: 'msgToClient', data: payload }
    }

    @SubscribeMessage('saveSocketId')
    async handleJoinRoom(client: Socket): Promise<void> {
        console.log('client id save to db', client.id)
        client.emit('isSavedSocketId', client.id)
        // await this.socketService.saveToSocketId(userId, client.id)
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

    async handleConnection(client: Socket) {
        console.log(`Client connected to notifi gateway: ${client.id}`);
        console.log(client.handshake.query['userId']);
        const userId: any = client.handshake.query['userId']
        await this.socketService.saveToSocketId(userId, client.id)
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from notifi gateway: ${client.id}`);
    }


}