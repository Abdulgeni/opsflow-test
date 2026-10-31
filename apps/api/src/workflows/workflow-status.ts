import type { PrismaService } from "../prisma/prisma.service";

export async function rejectedWorkflowIds(prisma: PrismaService): Promise<Set<string>> {
  const everRejected = await prisma.workflowTransition.findMany({
    where: { toStage: "Rejected" },
    distinct: ["workflowInstanceId"],
    select: { workflowInstanceId: true },
  });
  if (everRejected.length === 0) return new Set();

  const latest = await prisma.workflowTransition.findMany({
    where: { workflowInstanceId: { in: everRejected.map((t) => t.workflowInstanceId) } },
    orderBy: { createdAt: "desc" },
    distinct: ["workflowInstanceId"],
    select: { workflowInstanceId: true, toStage: true },
  });
  return new Set(latest.filter((t) => t.toStage === "Rejected").map((t) => t.workflowInstanceId));
}

interface CountableWorkflow {
  id: string;
  stages: unknown;
  currentStageIndex: number;
}

export function workflowCounts(workflows: CountableWorkflow[], rejected: Set<string>) {
  let open = 0;
  let completed = 0;
  let rejectedCount = 0;

  for (const wf of workflows) {
    if (rejected.has(wf.id)) {
      rejectedCount++;
      continue;
    }
    const total = (wf.stages as unknown[]).length;
    if (wf.currentStageIndex >= total - 1) completed++;
    else open++;
  }
  return { open, completed, rejected: rejectedCount, total: workflows.length };
}
