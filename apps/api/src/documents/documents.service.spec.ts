import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsService } from "./documents.service";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";

describe("DocumentsService", () => {
  let service: DocumentsService;
  let prisma: PrismaService;
  let testPropertyId: string;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService, PrismaService, StorageService],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Set up a real property and user to link the test document to.
    const property = await prisma.property.create({
      data: { name: "Jest Test Property", address: "1 Test St", type: "Residential", status: "AVAILABLE" },
    });
    testPropertyId = property.id;

    const user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    testUserId = user!.id;
  });

  afterAll(async () => {
    await prisma.property.delete({ where: { id: testPropertyId } }).catch(() => {});
    await prisma.$disconnect();
  });

  let createdId: string;

  it("creates a document with version 1 and a linked entity (CREATE)", async () => {
    const doc = await service.create({
      title: "Jest Test Document",
      category: "Legal",
      linkedEntityType: "Property",
      linkedEntityId: testPropertyId,
      uploadedById: testUserId,
    });
    expect(doc.version).toBe(1);
    createdId = doc.id;
  });

  it("reads the document back with its resolved linked entity name (READ)", async () => {
    const doc: any = await service.findOne(createdId);
    expect(doc.id).toBe(createdId);
    expect(doc.linkedEntityName).toBe("Jest Test Property");
  });

  it("returns null for linkedEntityName when the type is unrecognized", async () => {
    const name = await (service as any).resolveEntityName("Unknown", testPropertyId);
    expect(name).toBeNull();
  });

  afterAll(async () => {
    await prisma.documentVersion.deleteMany({ where: { documentId: createdId } }).catch(() => {});
    await prisma.document.delete({ where: { id: createdId } }).catch(() => {});
  });
});