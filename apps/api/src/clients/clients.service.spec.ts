import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ClientsService } from "./clients.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ClientsService", () => {
  let service: ClientsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientsService, PrismaService],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let createdId: string;
  const testEmail = `jest-client-${Date.now()}@example.com`;

  it("creates a client, defaulting to LEAD status (CREATE)", async () => {
    const client = await service.create({
      name: "Jest Test Client",
      type: "INDIVIDUAL",
      email: testEmail,
    });
    expect(client.status).toBe("LEAD");
    createdId = client.id;
  });

  it("reads the created client back (READ)", async () => {
    const client = await service.findOne(createdId);
    expect(client.id).toBe(createdId);
  });

  it("updates the client's status (UPDATE)", async () => {
    const updated = await service.update(createdId, { status: "ACTIVE" } as any);
    expect(updated.status).toBe("ACTIVE");
  });

  it("archives a client by setting status to ARCHIVED", async () => {
    const archived = await service.archive(createdId);
    expect(archived.status).toBe("ARCHIVED");
  });

  it("restores an archived client via unarchive", async () => {
    const restored = await service.unarchive(createdId);
    expect(restored.status).toBe("LEAD");
  });

  afterAll(async () => {
    await prisma.client.delete({ where: { id: createdId } }).catch(() => {});
  });
});