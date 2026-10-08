"use client";

import { useState } from "react";

export function EditLeaseModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    startDate: string;
    endDate: string;
    rentAmount: number;
    status: string;
    renewalNotes: string;
  }) => Promise<void>;
  initial: {
    startDate: string;
    endDate: string;
    rentAmount: number;
    status: string;
    renewalNotes: string;
  };
}) {
  const [startDate, setStartDate] = useState(initial.startDate.slice(0, 10));
  const [endDate, setEndDate] = useState(initial.endDate.slice(0, 10));
  const [rentAmount, setRentAmount] = useState(String(initial.rentAmount));
  const [status, setStatus] = useState(initial.status);
  const [renewalNotes, setRenewalNotes] = useState(initial.renewalNotes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }
    const amount = Number(rentAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setError("Rent amount must be a valid positive number");
      return;
    }

    setLoading(true);
    try {
      await onSave({ startDate, endDate, rentAmount: amount, status, renewalNotes });
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
        <h2 className="font-serif text-2xl text-primary mb-6">Edit lease</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Start date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">End date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Monthly rent</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            >
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Renewal notes</label>
            <textarea
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              rows={3}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm resize-none focus:border-gold focus:ring-gold"
            />
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
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}