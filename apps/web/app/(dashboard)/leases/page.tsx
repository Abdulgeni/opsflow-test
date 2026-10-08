"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddLeaseModal } from "@/components/leases/add-lease-modal";
import { EditLeaseModal } from "@/components/leases/edit-lease-modal";
import { fetchLeases, createLease, updateLease, ApiLease } from "@/lib/api/leases";
import { useToast } from "@/components/ui/toast";

type Tone = "positive" | "progress" | "warning" | "inactive" | "negative";

function leaseStatusTone(status: ApiLease["status"]): Tone {
  switch (status) {
    case "ACTIVE":
      return "positive";
    case "PENDING":
      return "progress";
    case "EXPIRED":
      return "inactive";
    case "TERMINATED":
      return "negative";
    default:
      return "inactive";
  }
}

const STATUSES: ApiLease["status"][] = ["PENDING", "ACTIVE", "EXPIRED", "TERMINATED"];

export default function LeasesPage() {
  const [leases, setLeases] = useState<ApiLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<ApiLease | null>(null);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeases(status ? { status } : undefined);
      setLeases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leases");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleAdd(data: {
    propertyId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
  }) {
    await createLease(data);
    await load();
    show("Lease created successfully");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="w-10 h-1 bg-gold rounded-full mb-3" />
          <h1 className="font-serif text-3xl text-primary">Leases</h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity btn-glow"
        >
          + Add lease
        </button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
          >
            <option value="">Status: All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
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
            <button onClick={load} className="text-sm text-gold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && leases.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant">
              {status ? "No leases match this status." : "No leases yet. Create one to get started."}
            </p>
          </div>
        )}

        {!loading && !error && leases.length > 0 && (
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                  {["Property", "Client", "Term", "Rent", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {leases.map((l, i) => (
                  <tr
                    key={l.id}
                    style={{ animationDelay: `${i * 30}ms` }}
                    className="animate-in hover:bg-surface-bright/50 transition-colors"
                  >
                    <td className="py-4 px-2 text-sm text-primary font-medium">
                      {l.property.name}
                    </td>
                    <td className="py-4 px-2 text-sm text-on-surface-variant">
                      {l.client?.name ?? "—"}
                    </td>
                    <td className="py-4 px-2 text-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(l.startDate).toLocaleDateString()} –{" "}
                      {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2 text-sm text-on-surface whitespace-nowrap">
                      ${l.rentAmount.toLocaleString()}/mo
                    </td>
                    <td className="py-4 px-2">
                      <Badge tone={leaseStatusTone(l.status)}>{l.status}</Badge>
                    </td>
                    <td className="py-4 px-2">
                      <button
                        onClick={() => setEditingLease(l)}
                        className="text-gold hover:underline text-sm"
                        aria-label="Edit lease"
                        title="Edit lease"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddLeaseModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />

      {editingLease && (
        <EditLeaseModal
          open={!!editingLease}
          onClose={() => setEditingLease(null)}
          initial={{
            startDate: editingLease.startDate,
            endDate: editingLease.endDate,
            rentAmount: editingLease.rentAmount,
            status: editingLease.status,
            renewalNotes: editingLease.renewalNotes || "",
          }}
          onSave={async (data) => {
            await updateLease(editingLease.id, data);
            await load();
            show("Lease updated successfully");
          }}
        />
      )}
    </div>
  );
}