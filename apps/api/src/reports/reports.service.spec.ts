import { Test, TestingModule } from "@nestjs/testing";
import { ReportsService } from "./reports.service";
import { PrismaService } from "../prisma/prisma.service";

/**
 * SRS Section 8 / 4.5.1 — the Property Occupancy breakdown.
 *
 * Unlike properties.service.spec.ts, this spec stubs PrismaService instead of
 * using the real dev database. What's under test is a percentage of *every*
 * property row, which can't be asserted while the other spec's rows (and
 * whatever else is in the dev database) come and go. The stub returns the shape
 * groupBy returns, so the zero-filling and the percentage arithmetic are what
 * actually get exercised. No DATABASE_URL needed.
 */

// Mirrors a Prisma groupBy result: one entry per status that has rows.
function groups(counts: Record<string, number>) {
  return Object.entries(counts).map(([status, count]) => ({
    status,
    _count: { status: count },
  }));
}

describe("ReportsService — getPropertyOccupancy", () => {
  let service: ReportsService;
  const groupBy = jest.fn();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: { property: { groupBy } } }],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  beforeEach(() => {
    groupBy.mockReset();
  });

  it("counts each status and turns it into a percentage of the total", async () => {
    groupBy.mockResolvedValue(
      groups({ AVAILABLE: 5, OCCUPIED: 3, UNDER_MAINTENANCE: 1, DECOMMISSIONED: 1 })
    );

    const result = await service.getPropertyOccupancy();

    expect(result.total).toBe(10);
    expect(result.breakdown).toEqual([
      { status: "AVAILABLE", count: 5, percentage: 50 },
      { status: "OCCUPIED", count: 3, percentage: 30 },
      { status: "UNDER_MAINTENANCE", count: 1, percentage: 10 },
      { status: "DECOMMISSIONED", count: 1, percentage: 10 },
    ]);
  });

  it("reports a status with no properties as zero instead of omitting it", async () => {
    groupBy.mockResolvedValue(groups({ AVAILABLE: 10, UNDER_MAINTENANCE: 2 }));

    const result = await service.getPropertyOccupancy();

    expect(result.total).toBe(12);
    expect(result.breakdown.map((row) => row.status)).toEqual([
      "AVAILABLE",
      "OCCUPIED",
      "UNDER_MAINTENANCE",
      "DECOMMISSIONED",
    ]);
    expect(result.breakdown).toContainEqual({ status: "OCCUPIED", count: 0, percentage: 0 });
    expect(result.breakdown).toContainEqual({ status: "DECOMMISSIONED", count: 0, percentage: 0 });
  });

  it("returns a zero total without NaN or Infinity when there are no properties", async () => {
    groupBy.mockResolvedValue([]);

    const result = await service.getPropertyOccupancy();

    expect(result.total).toBe(0);
    expect(result.breakdown).toHaveLength(4);
    for (const row of result.breakdown) {
      expect(row.count).toBe(0);
      expect(row.percentage).toBe(0);
      expect(Number.isFinite(row.percentage)).toBe(true);
    }
  });

  it("groups on Property.status and excludes archived properties", async () => {
    groupBy.mockResolvedValue([]);

    await service.getPropertyOccupancy();

    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ["status"], where: { archivedAt: null } })
    );
  });
});
