import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? "http://localhost:3000" } })
export class WorkflowsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("joinWorkflow")
  handleJoin(@MessageBody() workflowId: string, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (!user || user.role === "CLIENT" || typeof workflowId !== "string") return;
    client.join(`workflow:${workflowId}`);
  }

  @SubscribeMessage("leaveWorkflow")
  handleLeave(@MessageBody() workflowId: string, @ConnectedSocket() client: Socket) {
    client.leave(`workflow:${workflowId}`);
  }

  broadcastNewComment(workflowId: string, comment: unknown) {
    this.server.to(`workflow:${workflowId}`).emit("comment:new", comment);
  }

  broadcastWorkflowUpdated(workflowId: string) {
    this.server.to(`workflow:${workflowId}`).emit("workflow:updated", { id: workflowId });
  }
}
