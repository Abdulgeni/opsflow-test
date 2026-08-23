import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("workflows")
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get()
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.workflowsService.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() data: { title: string; stages: string[]; linkedTo?: string }) {
    return this.workflowsService.create(data);
  }

  // SRS 4.4.4: only Admin/Manager can advance a stage.
  @Post(":id/advance")
  @Roles("ADMIN", "MANAGER")
  advance(@Param("id") id: string, @Req() req: any, @Body("comment") comment?: string) {
    return this.workflowsService.advance(id, req.user.id, comment);
  }

  @Post(":id/reject")
  @Roles("ADMIN", "MANAGER")
  reject(@Param("id") id: string, @Req() req: any, @Body("comment") comment?: string) {
    return this.workflowsService.reject(id, req.user.id, comment);
  }

  @Post(":id/comments")
  addComment(@Param("id") id: string, @Req() req: any, @Body("body") body: string) {
    return this.workflowsService.addComment(id, req.user.id, body);
  }
}