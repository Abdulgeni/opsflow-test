import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { PropertiesService } from "./properties.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("properties")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  findAll(
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("search") search?: string
  ) {
    return this.propertiesService.findAll({ status, type, search });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  create(@Body() data: { name: string; address: string; type: string; size?: number }) {
    return this.propertiesService.create(data);
  }

  @Patch(":id")
  @Roles("ADMIN", "MANAGER")
  update(@Param("id") id: string, @Body() data: any) {
    return this.propertiesService.update(id, data);
  }

  @Delete(":id")
  @Roles("ADMIN")
  archive(@Param("id") id: string) {
    return this.propertiesService.archive(id);
  }

  @Post(":id/maintenance")
  createMaintenanceRequest(@Param("id") id: string, @Body("description") description: string) {
    return this.propertiesService.createMaintenanceRequest(id, description);
  }

  @Patch("maintenance/:id/resolve")
  @Roles("ADMIN", "MANAGER")
  resolveMaintenanceRequest(@Param("id") id: string) {
    return this.propertiesService.resolveMaintenanceRequest(id);
  }
}