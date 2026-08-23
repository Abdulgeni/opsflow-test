import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsSnapshotService {
  private readonly logger = new Logger(ReportsSnapshotService.name);

  constructor(private prisma: PrismaService) {}

  // Runs automatically once a day. For testing purposes, we'll also
  // expose a manual trigger endpoint (see reports.controller.ts) so we
  // don't have to wait 24 hours to see it work.
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async captureDailySnapshot() {
    await this.captureNow();
    this.logger.log("Daily report snapshot captured");
  }

  async captureNow() {
    const [properties, activeClients, documents, workflows] = await Promise.all([
      this.prisma.property.count({ where: { archivedAt: null } }),
      this.prisma.client.count({ where: { status: "ACTIVE" } }),
      this.prisma.document.count(),
      this.prisma.workflowInstance.findMany(),
    ]);

    const openWorkflows = workflows.filter((wf) => {
      const stages = wf.stages as string[];
      return wf.currentStageIndex < stages.length - 1;
    }).length;

    const completed = workflows.filter((wf) => {
      const stages = wf.stages as string[];
      return wf.currentStageIndex === stages.length - 1;
    }).length;

    const completionRate = workflows.length > 0 ? Math.round((completed / workflows.length) * 100) : 0;

    return this.prisma.reportSnapshot.create({
      data: { properties, activeClients, documents, openWorkflows, completionRate },
    });
  }

  async getHistory(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.reportSnapshot.findMany({
      where: { capturedAt: { gte: since } },
      orderBy: { capturedAt: "asc" },
    });
  }
}