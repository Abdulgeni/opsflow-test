import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PropertyStatus } from "../generated/prisma/client";
import { OccupancyResponse, OccupancyResponseSchema } from "./reports.schema";

// Read off the generated enum so the breakdown can't drift from the schema.
// Object.values keeps declaration order — AVAILABLE, OCCUPIED,
// UNDER_MAINTENANCE, DECOMMISSIONED — which is the lifecycle order the report
// reads best in, and the same order Postgres sorts this native enum by.
const ALL_STATUSES = Object.values(PropertyStatus);

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // SRS 4.5.1/4.5.3 — a grouped count of the *current* Property.status, not
  // per-property occupancy history (that stays in Module 1).
  //
  // Archived properties are excluded so these counts reconcile with the
  // Properties KPI shown above the table on the same page, which also
  // filters on archivedAt: null.
  async getPropertyOccupancy(): Promise<OccupancyResponse> {
    const grouped = await this.prisma.property.groupBy({
      by: ["status"],
      where: { archivedAt: null },
      _count: { status: true },
    });

    const counts = new Map(grouped.map((group) => [group.status, group._count.status]));

    // Summing the groups beats a second count() query: one round trip instead
    // of two, and the total can't disagree with the rows the way two separate
    // queries straddling a write could.
    const total = grouped.reduce((sum, group) => sum + group._count.status, 0);

    // groupBy only returns statuses that have at least one property, so map
    // over every status instead and fill the gaps with zero — the report keeps
    // the same four rows whatever the data looks like.
    const breakdown = ALL_STATUSES.map((status) => {
      const count = counts.get(status) ?? 0;
      return {
        status,
        count,
        // The `total > 0` guard is what keeps an empty database from producing
        // 0/0. Whole percents, matching completionRate in
        // reports-snapshot.service.ts.
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return OccupancyResponseSchema.parse({ total, breakdown });
  }
}
