"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  fetchWorkflow,
  advanceWorkflow,
  rejectWorkflow,
  addWorkflowComment,
  ApiWorkflow,
  ApiTransition,
  ApiWorkflowComment,
} from "@/lib/api/workflows";

type FullWorkflow = ApiWorkflow & { transitions: ApiTransition[]; comments: ApiWorkflowComment[] };

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [wf, setWf] = useState<FullWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkflow(id);
      setWf(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAdvance() {
    setActionError(null);
    try {
      await advanceWorkflow(id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to advance");
    }
  }

  async function handleReject() {
    setActionError(null);
    try {
      await rejectWorkflow(id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject");
    }
  }

  async function handlePostComment() {
    if (!commentText.trim()) return;
    await addWorkflowComment(id, commentText.trim());
    setCommentText("");
    await load();
  }

  if (loading) return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  if (error || !wf) return <div className="text-sm text-status-negative-text">{error ?? "Workflow not found."}</div>;

  return (
    <div className="space-y-6">
      <Link href="/workflows" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
        ← Back to Workflows
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-primary">{wf.title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">Created {new Date(wf.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="border border-status-negative-text text-status-negative-text px-4 py-2 rounded-lg text-sm hover:bg-status-negative-bg transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAdvance}
            className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
          >
            Advance Stage
          </button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

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
                      isDone ? "bg-charcoal text-white" : isActive ? "border-2 border-gold text-gold bg-white" : "bg-surface-container-low text-on-surface-variant"
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
          {wf.transitions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No transitions logged yet.</p>
          ) : (
            <div className="space-y-4">
              {wf.transitions.map((t) => (
                <div key={t.id} className="pb-3 border-b border-surface-container-highest last:border-0">
                  <p className="text-sm font-medium text-on-surface">{t.fromStage} → {t.toStage}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Actor: {t.actor.name}</p>
                  {t.comment && <p className="text-sm text-on-surface-variant italic mt-1">"{t.comment}"</p>}
                  <p className="text-xs text-on-surface-variant mt-1">{new Date(t.createdAt).toLocaleString()}</p>
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
              {wf.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-xs flex-shrink-0">
                    {c.author.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {c.author.name} <span className="text-xs text-on-surface-variant font-normal">{new Date(c.createdAt).toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-on-surface-variant">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input
  type="text"
  placeholder="Add a comment..."
  value={commentText}
  onChange={(e) => setCommentText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handlePostComment();
  }}
  className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
/>
            <button onClick={handlePostComment} className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium">
              Post
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}