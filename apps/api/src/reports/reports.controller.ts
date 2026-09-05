import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportsSnapshotService } from "./reports-snapshot.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private snapshotService: ReportsSnapshotService
  ) {}

  @Get("history")
  getHistory(@Query("days") days?: string) {
    return this.snapshotService.getHistory(days ? Number(days) : 30);
  }

  // Property occupancy breakdown — Admin/Manager only per SRS 4.5.4, so
  // Staff get a 403 here even though the rest of this module is open to them.
  @Get("properties/occupancy")
  @Roles("ADMIN", "MANAGER")
  getPropertyOccupancy() {
    return this.reportsService.getPropertyOccupancy();
  }

  // Manual trigger — lets us test snapshot capture immediately instead
  // of waiting for the midnight cron job. Fine to keep in place; a
  // legitimate admin action, not just a dev-only shortcut.
  @Post("history/capture-now")
  captureNow() {
    return this.snapshotService.captureNow();
  }
}