"use client";

import { useEffect, useState } from "react";
import { fetchProperties, ApiProperty } from "@/lib/api/properties";
import { fetchClients, ApiClient } from "@/lib/api/clients";

export function AddLeaseModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    propertyId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
  }) => Promise<void> | void;
}) {
  const [propertyId, setPropertyId] = useState("");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingOptions(true);
    Promise.all([fetchProperties({}), fetchClients({})])
      .then(([p, c]) => {
        setProperties(p);
        setClients(c);
      })
      .catch(() => {
        setProperties([]);
        setClients([]);
      })
      .finally(() => setLoadingOptions(false));
  }, [open]);

  if (!open) return null;

  function reset() {
    setPropertyId("");
    setClientId("");
    setStartDate("");
    setEndDate("");
    setRentAmount("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!propertyId || !clientId || !startDate || !endDate || !rentAmount) {
      setError("All fields are required");
      return;
    }
    const amount = Number(rentAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setError("Rent amount must be a valid positive number");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        propertyId,
        clientId,
        startDate,
        endDate,
        rentAmount: amount,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lease");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <h2 className="font-serif text-2xl text-primary mb-1">Add lease</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Link a client to a property with a term and monthly rent.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Property</label>
            <select
              required
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={loadingOptions}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">{loadingOptions ? "Loading…" : "Select a property…"}</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Client</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={loadingOptions}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">{loadingOptions ? "Loading…" : "Select a client…"}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </div>

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
            <label className="block text-sm font-medium text-on-surface mb-1">
              Monthly rent (USD)
            </label>
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
              {loading ? "Creating…" : "Add lease"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}