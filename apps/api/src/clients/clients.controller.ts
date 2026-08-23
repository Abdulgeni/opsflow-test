import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("clients")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll(
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("search") search?: string
  ) {
    return this.clientsService.findAll({ status, type, search });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  create(@Body() data: { name: string; type: "INDIVIDUAL" | "ORGANIZATION"; email: string; phone?: string }) {
    return this.clientsService.create(data);
  }

  @Patch(":id")
  @Roles("ADMIN", "MANAGER")
  update(@Param("id") id: string, @Body() data: any) {
    return this.clientsService.update(id, data);
  }

  // Staff CAN add contact logs (SRS 4.2.4) — no role restriction here.
  @Post(":id/contact-log")
  addContactLog(@Param("id") id: string, @Req() req: any, @Body("notes") notes: string) {
    return this.clientsService.addContactLog(id, req.user.id, notes);
  }
}