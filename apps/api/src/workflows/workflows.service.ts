import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WorkflowsGateway } from "./workflows.gateway";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private gateway: WorkflowsGateway,
    private notifications: NotificationsService
  ) { }

  async findAll() {
    const workflows = await this.prisma.workflowInstance.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      workflows.map(async (workflow) => ({
        ...workflow,
        linkedEntityName: await this.resolveEntityName(workflow.linkedEntityType, workflow.linkedEntityId),
      }))
    );
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        transitions: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
        comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      },
    });
    if (!workflow) throw new NotFoundException("Workflow not found");

    const linkedEntityName = await this.resolveEntityName(workflow.linkedEntityType, workflow.linkedEntityId);

    return { ...workflow, linkedEntityName };
  }

  private async resolveEntityName(type: string | null, id: string | null): Promise<string | null> {
    if (!type || !id) return null;
    
    if (type === "Property") {
      const property = await this.prisma.property.findUnique({ where: { id }, select: { name: true } });
      return property?.name ?? null;
    }
    if (type === "Client") {
      const client = await this.prisma.client.findUnique({ where: { id }, select: { name: true } });
      return client?.name ?? null;
    }
    if (type === "Document") {
      const document = await this.prisma.document.findUnique({ where: { id }, select: { title: true } });
      return document?.title ?? null;
    }
    return null;
  }

  async create(data: { title: string; stages: string[]; linkedEntityType?: string; linkedEntityId?: string }) {
    return this.prisma.workflowInstance.create({
      data: {
        title: data.title,
        stages: data.stages,
        linkedEntityType: data.linkedEntityType,
        linkedEntityId: data.linkedEntityId,
        currentStageIndex: 0,
      },
    });
  }

  async updateTitle(id: string, title: string) {
    return this.prisma.workflowInstance.update({ where: { id }, data: { title } });
  }

  // SRS 4.4.5: cannot skip a stage — only advance exactly one step at a time.
  async advance(id: string, actorId: string, comment?: string) {
    const workflow = await this.prisma.workflowInstance.findUnique({ where: { id } });
    if (!workflow) throw new NotFoundException("Workflow not found");

    const stages = workflow.stages as string[];
    if (workflow.currentStageIndex >= stages.length - 1) {
      throw new BadRequestException({
        statusCode: 400,
        code: "INVALID_TRANSITION",
        message: "This workflow is already at its final stage",
      });
    }

    const fromStage = stages[workflow.currentStageIndex];
    const toStage = stages[workflow.currentStageIndex + 1];

    await this.prisma.workflowTransition.create({
      data: { workflowInstanceId: id, fromStage, toStage, actorId, comment },
    });

    const updated = await this.prisma.workflowInstance.update({
      where: { id },
      data: { currentStageIndex: workflow.currentStageIndex + 1 },
    });

    await this.notifications.create(actorId, `"${workflow.title}" advanced to "${toStage}"`);

    return updated;
  }

  async reject(id: string, actorId: string, comment?: string) {
    const workflow = await this.prisma.workflowInstance.findUnique({ where: { id } });
    if (!workflow) throw new NotFoundException("Workflow not found");

    const stages = workflow.stages as string[];
    const fromStage = stages[workflow.currentStageIndex];

    await this.prisma.workflowTransition.create({
      data: { workflowInstanceId: id, fromStage, toStage: "Rejected", actorId, comment },
    });

    return workflow;
  }

  async addComment(id: string, authorId: string, body: string) {
    const comment = await this.prisma.workflowComment.create({
      data: { workflowInstanceId: id, authorId, body },
      include: { author: { select: { name: true } } },
    });

    this.gateway.broadcastNewComment(id, comment);

    return comment;
  }

  async getAvailableProperties() {
    return this.prisma.property.findMany({ select: { id: true, name: true, type: true } });
  }

  async getAvailableDocuments() {
    return this.prisma.document.findMany({ select: { id: true, title: true, category: true } });
  }

  async getAvailableClients() {
    return this.prisma.client.findMany({ select: { id: true, name: true, type: true } });
  }

  async getAvailableUsers() {
    return this.prisma.user.findMany({ select: { id: true, name: true, role: true } });
  }
}