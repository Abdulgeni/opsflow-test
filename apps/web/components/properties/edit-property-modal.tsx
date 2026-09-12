"use client";

import { useState } from "react";

export function EditPropertyModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; address: string; type: string }) => Promise<void>;
  initial: { name: string; address: string; type: string };
}) {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [type, setType] = useState(initial.type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave({ name, address, type });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <h2 className="font-serif text-2xl text-primary mb-6">Edit property</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}