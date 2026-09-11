"use client";

import { useState } from "react";
import { EntityPicker } from "@/components/shared/entity-picker";

export function UploadDocumentModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; category: string; linkedEntityType: string; linkedEntityId: string; file: File | null }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Legal");
  const [linkedEntityType, setLinkedEntityType] = useState("");
  const [linkedEntityId, setLinkedEntityId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title || !linkedEntityId) return;
    setLoading(true);
    try {
      await onUpload({ title, category, linkedEntityType, linkedEntityId, file });
      setTitle("");
      setCategory("Legal");
      setLinkedEntityType("");
      setLinkedEntityId("");
      setFile(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-8 w-full max-w-md">
        <h2 className="font-serif text-2xl text-primary mb-1">Upload document</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Add a new document and link it to a record.
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
              placeholder="e.g. Lease Agreement.pdf"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            >
              <option value="Legal">Legal</option>
              <option value="Property">Property</option>
              <option value="Finance">Finance</option>
              <option value="Compliance">Compliance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Linked to</label>
            <EntityPicker
              entityType={linkedEntityType}
              entityId={linkedEntityId}
              onChange={(type, id) => { setLinkedEntityType(type); setLinkedEntityId(id); }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-on-surface-variant file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-surface-container-low file:text-sm"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Attach a file to store it securely with this document record.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}