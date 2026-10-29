import { ConnectedSocket, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? "http://localhost:3000" } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const user = client.data.user;
    if (user) client.join(`user:${user.id}`);
  }

  @SubscribeMessage("joinUserNotifications")
  handleJoin(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (user) client.join(`user:${user.id}`);
  }

  broadcastNewNotification(userId: string, notification: unknown) {
    this.server.to(`user:${userId}`).emit("notification:new", notification);
  }
}
