import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { WorkflowsService } from "./workflows.service";
import { PrismaService } from "../prisma/prisma.service";
import { WorkflowsGateway } from "./workflows.gateway";
import { NotificationsService } from "../notifications/notifications.service";

const notificationsMock = { create: jest.fn() };

describe("WorkflowsService", () => {
  let service: WorkflowsService;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        PrismaService,
        { provide: WorkflowsGateway, useValue: { broadcastNewComment: jest.fn(), broadcastWorkflowUpdated: jest.fn() } },
        { provide: NotificationsService, useValue: notificationsMock },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
    prisma = module.get<PrismaService>(PrismaService);

    const testUser = await prisma.user.create({
      data: {
        name: "Jest Workflow Test User",
        email: `jest-workflow-user-${Date.now()}@example.com`,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let createdId: string;

  async function cleanup(workflowId: string) {
      await prisma.workflowTransition.deleteMany({ where: { workflowInstanceId: workflowId } });
      await prisma.workflowInstance.delete({ where: { id: workflowId } });
    }


  it("creates a workflow starting at stage index 0 (CREATE)", async () => {
    const wf = await service.create({
      title: "Jest Test Workflow",
      stages: [
        { name: "Submitted", role: "STAFF" },
        { name: "Review", role: "MANAGER" },
        { name: "Approved", role: "ADMIN" },
      ],
    });
    expect(wf.currentStageIndex).toBe(0);
    createdId = wf.id;
  });

  it("reads the workflow back (READ)", async () => {
    const wf = await service.findOne(createdId);
    expect(wf.id).toBe(createdId);
  });

  it("advances exactly one stage per call, never skipping (SRS 4.4.5)", async () => {
    const advanced = await service.advance(createdId, testUserId, "ADMIN");
    expect(advanced.currentStageIndex).toBe(1);
  });

  it("rejects advancing past the final stage with INVALID_TRANSITION", async () => {
    await service.advance(createdId, testUserId, "ADMIN"); // now at index 2 (Approved, the final stage)
    await expect(service.advance(createdId, testUserId, "ADMIN")).rejects.toThrow();
  });

  afterAll(async () => {
    await prisma.workflowTransition.deleteMany({ where: { workflowInstanceId: createdId } }).catch(() => {});
    await prisma.workflowComment.deleteMany({ where: { workflowInstanceId: createdId } }).catch(() => {});
    await prisma.workflowInstance.delete({ where: { id: createdId } }).catch(() => {});
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
  });

  it("reopens a rejected workflow: reason required, audited, approvers notified, advanceable again", async () => {
    const manager = await prisma.user.create({
      data: { name: "Jest Reopen Approver", email: `jest-reopen-${Date.now()}@example.com`, role: "MANAGER", status: "ACTIVE" },
    });
    const wf = await service.create({
      title: "Reopen test",
      stages: [
        { name: "Draft", role: "ADMIN" },
        { name: "Review", role: "MANAGER" },
        { name: "Done", role: "ADMIN" },
      ],
    });

    try {
      await service.advance(wf.id, testUserId, "ADMIN");
      await service.reject(wf.id, testUserId, "ADMIN", "not now");

      await expect(service.reopen(wf.id, testUserId, "   ")).rejects.toThrow();

      notificationsMock.create.mockClear();
      await service.reopen(wf.id, testUserId, "Budget approved");

      const [after] = await service.withRejectedFlag([wf]);
      expect(after.rejected).toBe(false);

      const recipients = notificationsMock.create.mock.calls.map((c) => c[0]);
      expect(recipients).toContain(manager.id);
      expect(recipients).not.toContain(testUserId);

      await expect(service.reopen(wf.id, testUserId, "again")).rejects.toThrow();
      await service.advance(wf.id, testUserId, "ADMIN");
    } finally {
      await cleanup(wf.id);
      await prisma.user.delete({ where: { id: manager.id } });
    }
  });

});