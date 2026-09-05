import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OccupancyResponse, OccupancyResponseSchema } from "./reports.schema";

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
      orderBy: { status: "asc" }, // stable row order for the report table
    });

    // groupBy only returns statuses that have at least one property, so a
    // status with no properties is absent from the breakdown rather than
    // reported as zero.
    const rows = grouped.map((group) => ({
      status: group.status,
      count: group._count.status,
    }));

    return OccupancyResponseSchema.parse(rows);
  }
}
