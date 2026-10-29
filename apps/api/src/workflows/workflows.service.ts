import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WorkflowsGateway } from "./workflows.gateway";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private prisma: PrismaService,
    private gateway: WorkflowsGateway,
    private notifications: NotificationsService
  ) { }

  async findAll() {
    const workflows = await this.prisma.workflowInstance.findMany({ orderBy: { createdAt: "desc" } });
    return Promise.all(workflows.map(async (workflow) => ({
      ...workflow,
      linkedEntityName: await this.resolveEntityName(workflow.linkedEntityType, workflow.linkedEntityId),
    })));
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

  async create(data: { title: string; stages: { name: string; role: string }[]; linkedEntityType?: string; linkedEntityId?: string }) {
    return this.prisma.workflowInstance.create({
      data: { title: data.title, stages: data.stages, linkedEntityType: data.linkedEntityType, linkedEntityId: data.linkedEntityId, currentStageIndex: 0 },
    });
  }

  async updateTitle(id: string, title: string) {
    return this.prisma.workflowInstance.update({ where: { id }, data: { title } });
  }

  private normalizeStages(raw: any): { name: string; role: string }[] {
    return (raw as any[]).map((s) => typeof s === "string" ? { name: s, role: "MANAGER" } : s);
  }

  private canActOnStage(userRole: string, stageRole: string): boolean {
    if (userRole === "ADMIN") return true;
    return userRole === stageRole;
  }

  async advance(id: string, actorId: string, actorRole: string, comment?: string) {
    const workflow = await this.prisma.workflowInstance.findUnique({ where: { id } });
    if (!workflow) throw new NotFoundException("Workflow not found");

    const stages = this.normalizeStages(workflow.stages);
    if (workflow.currentStageIndex >= stages.length - 1) {
      throw new BadRequestException({ statusCode: 400, code: "INVALID_TRANSITION", message: "This workflow is already at its final stage" });
    }

    const currentStage = stages[workflow.currentStageIndex];
    if (!this.canActOnStage(actorRole, currentStage.role)) {
      throw new ForbiddenException({ statusCode: 403, code: "FORBIDDEN_STAGE_ROLE", message: `Only ${currentStage.role} (or Admin) can advance the "${currentStage.name}" stage` });
    }

    const nextIndex = workflow.currentStageIndex + 1;
    const nextStage = stages[nextIndex];
    const fromStage = currentStage.name;
    const toStage = nextStage.name;

    const updated = await this.prisma.$transaction(async (tx) => {
      const moved = await tx.workflowInstance.updateMany({
        where: { id, currentStageIndex: workflow.currentStageIndex },
        data: { currentStageIndex: nextIndex },
      });
      if (moved.count !== 1) {
        throw new ConflictException({ statusCode: 409, code: "STAGE_ALREADY_CHANGED", message: "Someone else just moved this workflow. Refresh and try again." });
      }
      await tx.workflowTransition.create({ data: { workflowInstanceId: id, fromStage, toStage, actorId, comment } });
      return tx.workflowInstance.findUniqueOrThrow({ where: { id } });
    });

    this.gateway.broadcastWorkflowUpdated(id);

    try {
      await this.notifyAfterAdvance(workflow, stages, nextIndex, actorId);
    } catch (err) {
      this.logger.warn(`Could not send notifications for workflow ${id}: ${err}`);
    }

    return updated;
  }

  private async notifyAfterAdvance(workflow: { id: string; title: string }, stages: { name: string; role: string }[], newIndex: number, actorId: string) {
    const link = { type: "workflow", id: workflow.id };

    if (newIndex === stages.length - 1) {
      const past = await this.prisma.workflowTransition.findMany({ where: { workflowInstanceId: workflow.id }, select: { actorId: true } });
      const participants = [...new Set(past.map((t) => t.actorId))].filter((uid) => uid !== actorId);
      await Promise.all(participants.map((uid) => this.notifications.create(uid, `"${workflow.title}" has been fully approved`, link)));
      return;
    }

    const next = stages[newIndex];
    const approvers = await this.prisma.user.findMany({
      where: { role: next.role as any, status: "ACTIVE", id: { not: actorId } },
      select: { id: true },
    });
    await Promise.all(approvers.map((u) => this.notifications.create(u.id, `"${workflow.title}" needs your approval at "${next.name}"`, link)));
  }

  async reject(id: string, actorId: string, actorRole: string, comment?: string) {
    const workflow = await this.prisma.workflowInstance.findUnique({ where: { id } });
    if (!workflow) throw new NotFoundException("Workflow not found");

    const stages = this.normalizeStages(workflow.stages);
    const currentStage = stages[workflow.currentStageIndex];

    if (!this.canActOnStage(actorRole, currentStage.role)) {
      throw new ForbiddenException({ statusCode: 403, code: "FORBIDDEN_STAGE_ROLE", message: `Only ${currentStage.role} (or Admin) can reject at the "${currentStage.name}" stage` });
    }

    await this.prisma.workflowTransition.create({
      data: { workflowInstanceId: id, fromStage: currentStage.name, toStage: "Rejected", actorId, comment },
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

  async getAvailableProperties() { return this.prisma.property.findMany({ select: { id: true, name: true, type: true } }); }
  async getAvailableDocuments() { return this.prisma.document.findMany({ select: { id: true, title: true, category: true } }); }
  async getAvailableClients() { return this.prisma.client.findMany({ select: { id: true, name: true, type: true } }); }
  async getAvailableUsers() { return this.prisma.user.findMany({ select: { id: true, name: true, role: true } }); }
}
