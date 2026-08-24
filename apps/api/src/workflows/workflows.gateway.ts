import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? "http://localhost:3000" } })
export class WorkflowsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("joinWorkflow")
  handleJoin(@MessageBody() workflowId: string, @ConnectedSocket() client: Socket) {
    client.join(`workflow:${workflowId}`);
  }

  @SubscribeMessage("leaveWorkflow")
  handleLeave(@MessageBody() workflowId: string, @ConnectedSocket() client: Socket) {
    client.leave(`workflow:${workflowId}`);
  }

  broadcastNewComment(workflowId: string, comment: any) {
    this.server.to(`workflow:${workflowId}`).emit("comment:new", comment);
  }
}