import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ExecutiveService } from "./executive.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ExecutiveService", () => {
  let service: ExecutiveService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutiveService, PrismaService],
    }).compile();

    service = module.get<ExecutiveService>(ExecutiveService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns a summary with numeric fields, never NaN, even with sparse data", async () => {
    const summary = await service.getSummary();
    expect(typeof summary.properties).toBe("number");
    expect(typeof summary.completionRate).toBe("number");
    expect(Number.isNaN(summary.completionRate)).toBe(false);
  });

  it("returns an array of flags, correctly shaped, with no crash on empty data", async () => {
    const flags = await service.getFlags();
    expect(Array.isArray(flags)).toBe(true);
    if (flags.length > 0) {
      expect(flags[0]).toHaveProperty("reason");
    }
  });
});