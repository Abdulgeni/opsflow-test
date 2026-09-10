import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? "http://localhost:3000" } })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("joinUserNotifications")
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`user:${userId}`);
  }

  broadcastNewNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit("notification:new", notification);
  }
}