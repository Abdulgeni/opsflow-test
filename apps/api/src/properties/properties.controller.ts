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
    @Query("search") search?: string,
    @Query("includeArchived") includeArchived?: string
  ) {
    return this.propertiesService.findAll({ status, type, search, includeArchived: includeArchived === "true" });
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

  @Patch(":id/unarchive")
  @Roles("ADMIN")
  unarchive(@Param("id") id: string) {
    return this.propertiesService.unarchive(id);
  }

  @Post(":id/maintenance")
  createMaintenanceRequest(
    @Param("id") propertyId: string,
    @Body() data: { description: string; priority: "LOW" | "MEDIUM" | "HIGH" }
  ) {
    return this.propertiesService.createMaintenanceRequest(propertyId, data.description);
  }

  @Patch("maintenance/:id")
  @Roles("ADMIN", "MANAGER")
  updateMaintenanceRequest(@Param("id") id: string) {
    return this.propertiesService.resolveMaintenanceRequest(id);
  }

  @Post(":id/link-client")
  @Roles("ADMIN", "MANAGER")
  linkClient(@Param("id") id: string, @Body("clientId") clientId: string) {
    return this.propertiesService.linkClient(id, clientId);
  }

  @Delete("occupancy/:occupancyId")
  @Roles("ADMIN", "MANAGER")
  unlinkClient(@Param("occupancyId") occupancyId: string) {
    return this.propertiesService.unlinkClient(occupancyId);
  }
}