import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { WorkflowsService } from "./workflows.service";
import { PrismaService } from "../prisma/prisma.service";
import { WorkflowsGateway } from "./workflows.gateway";
import { NotificationsService } from "../notifications/notifications.service";

describe("WorkflowsService", () => {
  let service: WorkflowsService;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        PrismaService,
        { provide: WorkflowsGateway, useValue: { broadcastNewComment: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
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

  it("creates a workflow starting at stage index 0 (CREATE)", async () => {
    const wf = await service.create({ title: "Jest Test Workflow", stages: ["Submitted", "Review", "Approved"] });
    expect(wf.currentStageIndex).toBe(0);
    createdId = wf.id;
  });

  it("reads the workflow back (READ)", async () => {
    const wf = await service.findOne(createdId);
    expect(wf.id).toBe(createdId);
  });

  it("advances exactly one stage per call, never skipping (SRS 4.4.5)", async () => {
    const advanced = await service.advance(createdId, testUserId);
    expect(advanced.currentStageIndex).toBe(1);
  });

  it("rejects advancing past the final stage with INVALID_TRANSITION", async () => {
    await service.advance(createdId, testUserId); // now at index 2 (Approved, the final stage)
    await expect(service.advance(createdId, testUserId)).rejects.toThrow();
  });

  afterAll(async () => {
    await prisma.workflowTransition.deleteMany({ where: { workflowInstanceId: createdId } }).catch(() => {});
    await prisma.workflowComment.deleteMany({ where: { workflowInstanceId: createdId } }).catch(() => {});
    await prisma.workflowInstance.delete({ where: { id: createdId } }).catch(() => {});
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
  });
});