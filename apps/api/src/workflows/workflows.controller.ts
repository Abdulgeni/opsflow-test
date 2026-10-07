import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

const INTERNAL_ROLES = ["ADMIN", "MANAGER", "STAFF", "EXECUTIVE"];

@Controller("workflows")
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get()
  @Roles(...INTERNAL_ROLES)
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get("options/properties")
  @Roles(...INTERNAL_ROLES)
  getAvailableProperties() {
    return this.workflowsService.getAvailableProperties();
  }

  @Get("options/documents")
  @Roles(...INTERNAL_ROLES)
  getAvailableDocuments() {
    return this.workflowsService.getAvailableDocuments();
  }

  @Get("options/clients")
  @Roles(...INTERNAL_ROLES)
  getAvailableClients() {
    return this.workflowsService.getAvailableClients();
  }

  @Get("options/users")
  @Roles(...INTERNAL_ROLES)
  getAvailableUsers() {
    return this.workflowsService.getAvailableUsers();
  }

  @Get(":id")
  @Roles(...INTERNAL_ROLES)
  findOne(@Param("id") id: string) {
    return this.workflowsService.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() data: { title: string; stages: { name: string; role: string }[]; linkedEntityType?: string; linkedEntityId?: string }) {
    return this.workflowsService.create(data);
  }

  @Patch(":id")
  @Roles("ADMIN", "MANAGER")
  updateTitle(@Param("id") id: string, @Body("title") title: string) {
    return this.workflowsService.updateTitle(id, title);
  }

  @Post(":id/advance")
  @Roles(...INTERNAL_ROLES)
  advance(@Param("id") id: string, @Req() req: any, @Body("comment") comment?: string) {
    return this.workflowsService.advance(id, req.user.id, req.user.role, comment);
  }

  @Post(":id/reject")
  @Roles(...INTERNAL_ROLES)
  reject(@Param("id") id: string, @Req() req: any, @Body("comment") comment?: string) {
    return this.workflowsService.reject(id, req.user.id, req.user.role, comment);
  }

  @Post(":id/comments")
  @Roles(...INTERNAL_ROLES)
  addComment(@Param("id") id: string, @Req() req: any, @Body("body") body: string) {
    return this.workflowsService.addComment(id, req.user.id, body);
  }
}