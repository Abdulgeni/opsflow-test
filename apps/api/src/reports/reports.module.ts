import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsSnapshotService } from "./reports-snapshot.service";

@Module({
  controllers: [ReportsController],
  providers: [ReportsSnapshotService],
})
export class ReportsModule {}