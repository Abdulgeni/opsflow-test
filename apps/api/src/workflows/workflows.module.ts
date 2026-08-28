import { Module } from "@nestjs/common";
import { WorkflowsController } from "./workflows.controller";
import { WorkflowsService } from "./workflows.service";
import { WorkflowsGateway } from "./workflows.gateway";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowsGateway],
  exports: [WorkflowsGateway],
})
export class WorkflowsModule {}