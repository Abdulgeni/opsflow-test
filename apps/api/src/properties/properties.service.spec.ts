import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { PropertiesService } from "./properties.service";
import { PrismaService } from "../prisma/prisma.service";

/**
 * SRS Section 8: unit tests for the service layer covering at minimum
 * create, read, update, and one permission-denial case per module.
 * The permission-denial case for Properties is tested at the controller
 * level (see properties.controller.spec.ts) since role-checking happens
 * in RolesGuard, not in the service itself.
 */
describe("PropertiesService", () => {
  let service: PropertiesService;
  let prisma: PrismaService;

  // We use the REAL PrismaService against your actual dev database for
  // these tests, since setting up a fully isolated test database is a
  // larger undertaking. This means: run these against a database you
  // don't mind adding/removing a few test rows from.
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertiesService, PrismaService],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let createdId: string;

  it("creates a property (CREATE)", async () => {
    const property = await service.create({
      name: "Test Property — Jest",
      address: "123 Test St",
      type: "Residential",
    });

    expect(property).toBeDefined();
    expect(property.name).toBe("Test Property — Jest");
    expect(property.status).toBe("AVAILABLE"); // new properties default to Available

    createdId = property.id;
  });

  it("reads the created property back (READ)", async () => {
    const property = await service.findOne(createdId);
    expect(property.id).toBe(createdId);
    expect(property.name).toBe("Test Property — Jest");
  });

  it("updates the property (UPDATE)", async () => {
    const updated = await service.update(createdId, { name: "Updated Test Property" });
    expect(updated.name).toBe("Updated Test Property");
  });

  it("sets Property status to UNDER_MAINTENANCE when a maintenance request is created (SRS 4.1.5)", async () => {
    await service.createMaintenanceRequest(createdId, "Test maintenance issue");
    const property = await service.findOne(createdId);
    expect(property.status).toBe("UNDER_MAINTENANCE");
  });

  it("reverts Property status when the last open maintenance request is resolved (SRS 4.1.5)", async () => {
    const property = await service.findOne(createdId);
    const request = property.maintenanceRequests[0];

    await service.resolveMaintenanceRequest(request.id);

    const updated = await service.findOne(createdId);
    expect(updated.status).toBe("AVAILABLE"); // reverted to prior status
  });

  it("soft-deletes (archives) rather than hard-deleting (SRS 6, Data Integrity)", async () => {
    await service.archive(createdId);

    const results = await service.findAll({});
    const stillInList = results.find((p) => p.id === createdId);
    expect(stillInList).toBeUndefined(); // archived properties excluded from normal list

    // Clean up: directly verify the row still exists in the DB (not
    // actually deleted), confirming this was a soft-delete.
    const rawCheck = await prisma.property.findUnique({ where: { id: createdId } });
    expect(rawCheck).not.toBeNull();
    expect(rawCheck?.archivedAt).not.toBeNull();
  });
});