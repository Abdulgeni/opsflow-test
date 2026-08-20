"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_CLIENTS } from "@/lib/mock-data";
import { clientStatusTone, statusLabel } from "@/lib/status-tones";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Clients</h1>
        <button className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
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
          <select className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm">
            <option>Status: All</option>
          </select>
          <select className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm">
            <option>Type: All</option>
          </select>
        </div>

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
      </Card>
    </div>
  );
}