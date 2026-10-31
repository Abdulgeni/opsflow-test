import { rejectedWorkflowIds, workflowCounts } from "./workflow-status";

const wf = (id: string, stages: number, index: number) => ({
  id,
  stages: new Array(stages).fill("s"),
  currentStageIndex: index,
});

describe("workflowCounts", () => {
  it("separates open, completed and rejected", () => {
    const rows = [wf("open", 3, 1), wf("done", 3, 2), wf("rej", 3, 1)];
    expect(workflowCounts(rows, new Set(["rej"]))).toEqual({ open: 1, completed: 1, rejected: 1, total: 3 });
  });
  it("counts a rejected workflow as rejected even at the final stage (legacy data)", () => {
    expect(workflowCounts([wf("x", 3, 2)], new Set(["x"]))).toEqual({ open: 0, completed: 0, rejected: 1, total: 1 });
  });
  it("handles no workflows", () => {
    expect(workflowCounts([], new Set())).toEqual({ open: 0, completed: 0, rejected: 0, total: 0 });
  });
});

describe("rejectedWorkflowIds", () => {
  it("skips the second query when nothing was ever rejected", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const result = await rejectedWorkflowIds({ workflowTransition: { findMany } } as any);
    expect(result.size).toBe(0);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
  it("keeps only workflows whose latest audit entry is a rejection", async () => {
    const findMany = jest.fn()
      .mockResolvedValueOnce([{ workflowInstanceId: "a" }, { workflowInstanceId: "b" }])
      .mockResolvedValueOnce([
        { workflowInstanceId: "a", toStage: "Rejected" },
        { workflowInstanceId: "b", toStage: "Approved" },
      ]);
    const result = await rejectedWorkflowIds({ workflowTransition: { findMany } } as any);
    expect([...result]).toEqual(["a"]);
  });
});
