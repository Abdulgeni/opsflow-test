"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_WORKFLOWS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const wf = MOCK_WORKFLOWS.find((w) => w.id === id);

  if (!wf) return <div className="text-sm text-status-negative-text">Workflow not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/workflows" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
        ← Back to Workflows
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-on-surface-variant mb-1">Workflow / Documents / Lease Agreements</p>
          <h1 className="font-serif text-3xl text-primary">{wf.title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{wf.id} · Created {wf.createdAt}</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-status-negative-text text-status-negative-text px-4 py-2 rounded-lg text-sm hover:bg-status-negative-bg transition-colors">
            Reject
          </button>
          <button className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
            Advance Stage
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <div className="flex items-center">
          {wf.stages.map((stage, i) => {
            const isDone = i < wf.currentStageIndex;
            const isActive = i === wf.currentStageIndex;
            return (
              <div key={stage} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isDone
                        ? "bg-charcoal text-white"
                        : isActive
                        ? "border-2 border-gold text-gold bg-white"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? "font-medium text-primary" : "text-on-surface-variant"}`}>
                    {stage}
                  </span>
                </div>
                {i < wf.stages.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${isDone ? "bg-gold" : "bg-surface-container-highest"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Audit Trail">
          {wf.auditTrail.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No transitions logged yet.</p>
          ) : (
            <div className="space-y-4">
              {wf.auditTrail.map((entry, i) => (
                <div key={i} className="pb-3 border-b border-surface-container-highest last:border-0">
                  <p className="text-sm font-medium text-on-surface">{entry.fromStage} → {entry.toStage}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Actor: {entry.actor}</p>
                  <p className="text-sm text-on-surface-variant italic mt-1">"{entry.comment}"</p>
                  <p className="text-xs text-on-surface-variant mt-1">{entry.date}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Comments">
          {wf.comments.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {wf.comments.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-xs flex-shrink-0">
                    {c.author[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {c.author} <span className="text-xs text-on-surface-variant font-normal">{c.timeAgo}</span>
                    </p>
                    <p className="text-sm text-on-surface-variant">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input type="text" placeholder="Add a comment..." className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm" />
            <button className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium">Post</button>
          </div>
        </Card>
      </div>
    </div>
  );
}