"use client";

import { useState } from "react";
import { EntityPicker } from "@/components/shared/entity-picker";

interface Stage {
  name: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
}

const TEMPLATES: Record<string, Stage[]> = {
  "Custom": [],
  "Lease Approval": [
    { name: "Submitted", role: "STAFF" },
    { name: "Manager Review", role: "MANAGER" },
    { name: "Finance Review", role: "MANAGER" },
    { name: "Approved", role: "ADMIN" },
  ],
  "Maintenance Approval": [
    { name: "Submitted", role: "STAFF" },
    { name: "Manager Review", role: "MANAGER" },
    { name: "Approved", role: "ADMIN" },
  ],
  "Client Onboarding": [
    { name: "Submitted", role: "STAFF" },
    { name: "Manager Review", role: "MANAGER" },
    { name: "Finance Review", role: "MANAGER" },
    { name: "Approved", role: "ADMIN" },
  ],
  "Document Compliance Review": [
    { name: "Submitted", role: "STAFF" },
    { name: "Compliance Review", role: "MANAGER" },
    { name: "Executive Sign-off", role: "ADMIN" },
  ],
};

const ROLES: Stage["role"][] = ["STAFF", "MANAGER", "ADMIN"];

export function CreateWorkflowModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; stages: Stage[]; linkedEntityType?: string; linkedEntityId?: string }) => Promise<void>;
}) {
  const [templateName, setTemplateName] = useState("Custom");
  const [title, setTitle] = useState("");
  const [linkedEntityType, setLinkedEntityType] = useState("");
  const [linkedEntityId, setLinkedEntityId] = useState("");
  const [stages, setStages] = useState<Stage[]>([
    { name: "Submitted", role: "STAFF" },
    { name: "Manager Review", role: "MANAGER" },
    { name: "Approved", role: "ADMIN" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function applyTemplate(name: string) {
    setTemplateName(name);
    const preset = TEMPLATES[name];
    if (preset && preset.length > 0) setStages(preset.map((s) => ({ ...s })));
  }

  function updateStageName(index: number, value: string) {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, name: value } : s)));
  }
  function updateStageRole(index: number, role: Stage["role"]) {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, role } : s)));
  }
  function addStage() {
    setStages((prev) => [...prev, { name: "", role: "MANAGER" }]);
  }
  function removeStage(index: number) {
    if (stages.length <= 2) return;
    setStages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");
    const clean = stages.map((s) => ({ ...s, name: s.name.trim() })).filter((s) => s.name);
    if (clean.length < 2) return setError("A workflow needs at least 2 stages");

    setLoading(true);
    try {
      await onCreate({ title: title.trim(), stages: clean, linkedEntityType: linkedEntityType || undefined, linkedEntityId: linkedEntityId || undefined });
      setTitle("");
      setLinkedEntityType("");
      setLinkedEntityId("");
      applyTemplate("Custom");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto mx-4">
        <h2 className="font-serif text-2xl text-primary mb-1">Create workflow</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Each stage names the role authorized to advance or reject it. Admin can always act.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Template</label>
            <select
              value={templateName}
              onChange={(e) => applyTemplate(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            >
              {Object.keys(TEMPLATES).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

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
            <EntityPicker
              entityType={linkedEntityType}
              entityId={linkedEntityId}
              onChange={(type, id) => { setLinkedEntityType(type); setLinkedEntityId(id); }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Stages & authority (in order)</label>
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-5">{i + 1}.</span>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStageName(i, e.target.value)}
                    placeholder="Stage name"
                    className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
                  />
                  <select
                    value={stage.role}
                    onChange={(e) => updateStageRole(i, e.target.value as Stage["role"])}
                    className="rounded-lg border border-surface-container-highest px-2 py-2 text-sm w-32"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                  {stages.length > 2 && (
                    <button type="button" onClick={() => removeStage(i)} className="text-status-negative-text text-sm px-1" aria-label={`Remove stage ${i + 1}`}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addStage} className="mt-2 text-sm text-gold hover:underline">
              + Add stage
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Creating…" : "Create workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}