"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CreateWorkflowModal } from "@/components/workflows/create-workflow-modal";
import { fetchWorkflows, createWorkflow, ApiWorkflow } from "@/lib/api/workflows";
import { useToast } from "@/components/ui/toast";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<ApiWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: { title: string; stages: string[]; linkedTo?: string }) {
    await createWorkflow(data);
    await load();
    show("Workflow created successfully");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Workflows</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Create workflow
        </button>
      </div>

      <Card>
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-container-low rounded" />
            ))}
          </div>
        )}
        {error && <p className="text-sm text-status-negative-text text-center py-10">{error}</p>}
        {!loading && !error && workflows.length === 0 && (
          <p className="text-sm text-on-surface-variant text-center py-10">No workflows yet.</p>
        )}
        {!loading && !error && workflows.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                {["Title", "Current Stage", "Created"].map((h) => (
                  <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {workflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-2">
                    <Link href={`/workflows/${wf.id}`} className="text-sm text-primary font-medium hover:text-gold transition-colors">
                      {wf.title}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{wf.stages[wf.currentStageIndex]}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{new Date(wf.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <CreateWorkflowModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
}