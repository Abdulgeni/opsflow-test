import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { ReportsSnapshotService } from "./reports-snapshot.service";

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportsSnapshotService],
})
export class ReportsModule {}