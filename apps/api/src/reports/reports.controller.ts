import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ReportsSnapshotService } from "./reports-snapshot.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private snapshotService: ReportsSnapshotService) {}

  @Get("history")
  getHistory(@Query("days") days?: string) {
    return this.snapshotService.getHistory(days ? Number(days) : 30);
  }

  // Manual trigger — lets us test snapshot capture immediately instead
  // of waiting for the midnight cron job. Fine to keep in place; a
  // legitimate admin action, not just a dev-only shortcut.
  @Post("history/capture-now")
  captureNow() {
    return this.snapshotService.captureNow();
  }
}