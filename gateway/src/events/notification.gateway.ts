import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private clients: { [key: string]: string } = {};
    afterInit(server: Server) {
        console.log('WebSocket initialized');
    }

    handleConnection(client: any) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: any, userId: string) {
        client.join(userId);
        this.clients[client.id] = userId;
        console.log(`Client ${client.id} joined room: ${userId}`);
    }

    sendRiskAlert(userId: string, message: string) {
        this.server.to(userId).emit('notification', { message });
    }

}
