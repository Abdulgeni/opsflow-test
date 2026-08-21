"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddClientModal } from "@/components/clients/add-client-modal";
import { MOCK_CLIENTS, Client } from "@/lib/mock-data";
import { clientStatusTone, statusLabel } from "@/lib/status-tones";

const STATUSES = ["LEAD", "ACTIVE", "INACTIVE", "ARCHIVED"];
const TYPES = ["Individual", "Organization"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = clients.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (status && c.status !== status) return false;
    if (type && c.type !== type) return false;
    return true;
  });

  function handleAdd(data: { name: string; type: "Individual" | "Organization"; email: string; phone: string }) {
    const newClient: Client = {
      id: String(Date.now()),
      name: data.name,
      type: data.type,
      email: data.email,
      phone: data.phone,
      status: "LEAD",
    };
    setClients((prev) => [newClient, ...prev]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Clients</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add client
        </button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
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
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
          >
            <option value="">Status: All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
          >
            <option value="">Type: All</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant">No clients match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                {["Name", "Type", "Email", "Phone", "Status"].map((h) => (
                  <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-2">
                    <Link href={`/clients/${c.id}`} className="text-sm text-primary font-medium hover:text-gold transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{c.type}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{c.email}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{c.phone}</td>
                  <td className="py-4 px-2"><Badge tone={clientStatusTone(c.status)}>{statusLabel(c.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <AddClientModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}