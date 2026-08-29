"use client";

import { useState } from "react";

export function UploadDocumentModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; category: string; linkedTo: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Legal");
  const [linkedTo, setLinkedTo] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !linkedTo) return;
    onUpload({ title, category, linkedTo });
    setTitle("");
    setCategory("Legal");
    setLinkedTo("");
    onClose();
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-8 w-full max-w-md">
        <h2 className="font-serif text-2xl text-primary mb-1">Upload document</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Add a new document and link it to a record.
        </p>

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
            <input
              type="text"
              required
              placeholder="e.g. Sarah Chen or Alpha Towers"
              value={linkedTo}
              onChange={(e) => setLinkedTo(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">File</label>
            <input
              type="file"
              className="block w-full text-sm text-on-surface-variant file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-surface-container-low file:text-sm"
            />
           <p className="text-xs text-on-surface-variant mt-1">
  Attach a file for your own reference. Document details (title, category, version) are saved and tracked in OpsFlow.
</p>
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
              className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}