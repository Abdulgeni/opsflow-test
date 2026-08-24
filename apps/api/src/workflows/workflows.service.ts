import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WorkflowsGateway } from "./workflows.gateway";

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private gateway: WorkflowsGateway
  ) {}

  async findAll() {
    return this.prisma.workflowInstance.findMany({
      orderBy: { createdAt: "desc" },
    });
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
    return workflow;
  }

  async create(data: { title: string; stages: string[]; linkedTo?: string }) {
    return this.prisma.workflowInstance.create({
      data: { title: data.title, stages: data.stages, linkedTo: data.linkedTo, currentStageIndex: 0 },
    });
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

    return this.prisma.workflowInstance.update({
      where: { id },
      data: { currentStageIndex: workflow.currentStageIndex + 1 },
    });
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
}