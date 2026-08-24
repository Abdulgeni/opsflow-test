import { Module } from "@nestjs/common";
import { WorkflowsController } from "./workflows.controller";
import { WorkflowsService } from "./workflows.service";
import { WorkflowsGateway } from "./workflows.gateway";

@Module({
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowsGateway],
  exports: [WorkflowsGateway],
})
export class WorkflowsModule {}