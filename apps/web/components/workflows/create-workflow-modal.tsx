"use client";

import { useState } from "react";

export function CreateWorkflowModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; stages: string[]; linkedTo?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [linkedTo, setLinkedTo] = useState("");
  const [stages, setStages] = useState<string[]>(["Submitted", "Manager Review", "Approved"]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function updateStage(index: number, value: string) {
    setStages((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addStage() {
    setStages((prev) => [...prev, ""]);
  }

  function removeStage(index: number) {
    if (stages.length <= 2) return; // a workflow needs at least 2 stages
    setStages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    const cleanStages = stages.map((s) => s.trim()).filter(Boolean);
    if (cleanStages.length < 2) {
      setError("A workflow needs at least 2 stages");
      return;
    }

    setLoading(true);
    try {
      await onCreate({ title: title.trim(), stages: cleanStages, linkedTo: linkedTo.trim() || undefined });
      setTitle("");
      setLinkedTo("");
      setStages(["Submitted", "Manager Review", "Approved"]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-2xl text-primary mb-1">Create workflow</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Define the title and ordered stages for this workflow.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Lease Approval - Alpha Towers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Linked to (optional)</label>
            <input
              type="text"
              placeholder="e.g. Alpha Towers or a client name"
              value={linkedTo}
              onChange={(e) => setLinkedTo(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Stages (in order)</label>
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-5">{i + 1}.</span>
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => updateStage(i, e.target.value)}
                    className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
                  />
                  {stages.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeStage(i)}
                      className="text-status-negative-text text-sm px-2"
                      aria-label={`Remove stage ${i + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStage}
              className="mt-2 text-sm text-gold hover:underline"
            >
              + Add stage
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}