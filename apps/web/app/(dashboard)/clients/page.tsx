"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddClientModal } from "@/components/clients/add-client-modal";
import { fetchClients, createClient, unarchiveClient, ApiClient } from "@/lib/api/clients";
import { clientStatusTone, statusLabel } from "@/lib/status-tones";
import { useToast } from "@/components/ui/toast";

const STATUSES = ["LEAD", "ACTIVE", "INACTIVE"];
const TYPES = ["INDIVIDUAL", "ORGANIZATION"];

export default function ClientsPage() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients({ search, status, type, includeArchived: showArchived });
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, type, showArchived]);

  async function handleAdd(data: { name: string; type: "Individual" | "Organization"; email: string; phone: string }) {
    await createClient({
      name: data.name,
      type: data.type.toUpperCase() as "INDIVIDUAL" | "ORGANIZATION",
      email: data.email,
      phone: data.phone,
    });
    await load();
    show("Client added successfully");
  }

  async function handleRestore(id: string) {
    try {
      await unarchiveClient(id);
      show("Client restored");
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to restore client");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Wrapped title with gold accent line */}
        <div>
          <div className="w-10 h-1 bg-gold rounded-full mb-3" />
          <h1 className="font-serif text-3xl text-primary">Clients</h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add client
        </button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-surface-container-highest px-4 py-2 text-sm focus:border-gold focus:ring-gold"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={showArchived}
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Status: All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
          >
            <option value="">Type: All</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-surface-container-highest"
            />
            Show archived
          </label>
        </div>

        {loading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-container-low rounded" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-sm text-status-negative-text mb-2">{error}</p>
            <button onClick={load} className="text-sm text-gold underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant">
              {showArchived ? "No archived clients." : "No clients match your filters."}
            </p>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                  {["Name", "Type", "Email", "Phone", "Status", showArchived ? "Actions" : ""].filter(Boolean).map((h) => (
                    <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-bright/50 transition-colors">
                    <td className="py-4 px-2">
                      <Link href={`/clients/${c.id}`} className="text-sm text-primary font-medium hover:text-gold transition-colors">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-4 px-2 text-sm text-on-surface-variant">
                      {c.type.charAt(0) + c.type.slice(1).toLowerCase()}
                    </td>
                    <td className="py-4 px-2 text-sm text-on-surface-variant">{c.email}</td>
                    <td className="py-4 px-2 text-sm text-on-surface-variant">{c.phone ?? "—"}</td>
                    <td className="py-4 px-2">
                      <Badge tone={clientStatusTone(c.status)}>{statusLabel(c.status)}</Badge>
                    </td>
                    {showArchived && (
                      <td className="py-4 px-2">
                        <button
                          onClick={() => handleRestore(c.id)}
                          className="text-xs text-gold hover:underline"
                        >
                          Restore
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddClientModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}