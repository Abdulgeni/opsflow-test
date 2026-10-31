import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("workflows")
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get()
  @Roles("ADMIN", "MANAGER", "STAFF", "EXECUTIVE")
  async findAll() {
    return this.workflowsService.withRejectedFlag(await this.workflowsService.findAll());
  }

  @Get(":id")
  @Roles("ADMIN", "MANAGER", "STAFF", "EXECUTIVE")
  async findOne(@Param("id") id: string) {
    const [workflow] = await this.workflowsService.withRejectedFlag([await this.workflowsService.findOne(id)]);
    return workflow;
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  create(@Body() data: any) { return this.workflowsService.create(data); }

  @Patch(":id")
  @Roles("ADMIN", "MANAGER")
  updateTitle(@Param("id") id: string, @Body("title") title: string) { return this.workflowsService.updateTitle(id, title); }

  @Post(":id/advance")
  @Roles("ADMIN", "MANAGER", "STAFF")
  advance(@Param("id") id: string, @Req() req: any, @Body("comment") comment?: string) { return this.workflowsService.advance(id, req.user.id, req.user.role, comment); }

  @Post(":id/reject")
  @Roles("ADMIN", "MANAGER", "STAFF")
  reject(@Param("id") id: string, @Req() req: any, @Body("comment") comment?: string) { return this.workflowsService.reject(id, req.user.id, req.user.role, comment); }

  @Post(":id/comments")
  @Roles("ADMIN", "MANAGER", "STAFF", "EXECUTIVE")
  addComment(@Param("id") id: string, @Req() req: any, @Body("body") body: string) { return this.workflowsService.addComment(id, req.user.id, body); }

  @Get("available/properties")
  @Roles("ADMIN", "MANAGER", "STAFF")
  getAvailableProperties() { return this.workflowsService.getAvailableProperties(); }

  @Get("available/documents")
  @Roles("ADMIN", "MANAGER", "STAFF")
  getAvailableDocuments() { return this.workflowsService.getAvailableDocuments(); }

  @Get("available/clients")
  @Roles("ADMIN", "MANAGER", "STAFF")
  getAvailableClients() { return this.workflowsService.getAvailableClients(); }

  @Get("available/users")
  @Roles("ADMIN", "MANAGER", "STAFF")
  getAvailableUsers() { return this.workflowsService.getAvailableUsers(); }
}
