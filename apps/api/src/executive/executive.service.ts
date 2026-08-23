import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExecutiveService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [propertiesCount, activeClientsCount, documentsCount, workflows] = await Promise.all([
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

    return {
      properties: propertiesCount,
      activeClients: activeClientsCount,
      documents: documentsCount,
      openWorkflows,
      completionRate,
    };
  }

  // Counts weekdays only (Mon–Fri) between two dates — matches SRS 4.7.1's
  // "5 business days" requirement exactly, not calendar days.
  private countBusinessDays(from: Date, to: Date): number {
    let count = 0;
    const cur = new Date(from);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);

    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; // skip Sunday (0) and Saturday (6)
    }
    return count;
  }

  async getFlags() {
    const flags: { id: string; title: string; reason: string }[] = [];
    const now = new Date();

    const workflows = await this.prisma.workflowInstance.findMany({
      include: { transitions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    for (const wf of workflows) {
      const stages = wf.stages as string[];
      const isFinal = wf.currentStageIndex >= stages.length - 1;
      if (isFinal) continue;

      const lastMoved = wf.transitions[0]?.createdAt ?? wf.createdAt;
      const businessDaysInStage = this.countBusinessDays(new Date(lastMoved), now);

      if (businessDaysInStage > 5) {
        flags.push({
          id: wf.id,
          title: wf.title,
          reason: `Stalled ${businessDaysInStage} business days in current stage`,
        });
      }
    }

    const properties = await this.prisma.property.findMany({
      where: { status: "UNDER_MAINTENANCE", archivedAt: null },
    });

    for (const p of properties) {
      // Calendar days is correct here per SRS 4.7.1 — only the workflow
      // threshold specifies "business days"; the property threshold says
      // "calendar days" explicitly.
      const daysUnderMaintenance = Math.floor((now.getTime() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysUnderMaintenance > 10) {
        flags.push({
          id: p.id,
          title: `Property: ${p.name}`,
          reason: `Under maintenance ${daysUnderMaintenance} days`,
        });
      }
    }

    return flags;
  }

  async addNote(linkedTo: string, authorId: string, note: string) {
    return this.prisma.executiveNote.create({
      data: { linkedTo, authorId, note },
    });
  }

  async getNotes() {
    return this.prisma.executiveNote.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
  }
}