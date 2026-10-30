import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { LeasesService } from "./leases.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AllowClient, Roles, RolesGuard } from "../auth/roles.guard";

@Controller("leases")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeasesController {
  constructor(private leasesService: LeasesService) {}

  @Get()
  @Roles("ADMIN", "MANAGER", "STAFF")
  findAll(
    @Query("propertyId") propertyId?: string,
    @Query("clientId") clientId?: string,
    @Query("status") status?: string
  ) {
    return this.leasesService.findAll({ propertyId, clientId, status });
  }

  @Get("mine")
  @Roles("CLIENT")
  findMine(@Req() req: any) {
    if (!req.user.clientId) return [];
    return this.leasesService.findForPortalUser(req.user.clientId);
  }

  @Get(":id")
  @AllowClient()
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.leasesService.findOne(id, req.user);
  }

  @Get(":id/documents")
  @AllowClient()
  async getLeaseDocuments(@Param("id") id: string, @Req() req: any) {
    const lease = await this.leasesService.findOne(id, req.user);
    return this.leasesService.findLinkedDocuments(lease.propertyId);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  create(
    @Body() data: { propertyId: string; clientId: string; startDate: string; endDate: string; rentAmount: number; }
  ) {
    return this.leasesService.create(data);
  }

  @Patch(":id")
  @Roles("ADMIN", "MANAGER")
  update(@Param("id") id: string, @Body() data: any) {
    return this.leasesService.update(id, data);
  }
}
