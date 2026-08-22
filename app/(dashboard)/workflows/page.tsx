"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchWorkflows, ApiWorkflow } from "@/lib/api/workflows";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<ApiWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows()
      .then(setWorkflows)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load workflows"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-primary">Workflows</h1>
      <Card>
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-container-low rounded" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-sm text-status-negative-text text-center py-10">{error}</p>
        )}
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
    </div>
  );
}