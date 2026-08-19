"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { propertyStatusTone, statusLabel } from "@/lib/status-tones";

const STATUSES = ["AVAILABLE", "OCCUPIED", "UNDER_MAINTENANCE", "DECOMMISSIONED"];

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const filtered = MOCK_PROPERTIES.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (status && p.status !== status) return false;
    if (type && p.type !== type) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Properties</h1>
        <button className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          + Add property
        </button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search properties..."
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
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant mb-3">No properties match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                {["Name", "Address", "Type", "Status"].map((h) => (
                  <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-2">
                    <Link
                      href={`/properties/${p.id}`}
                      className="text-sm text-primary font-medium hover:text-gold transition-colors"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{p.address}</td>
                  <td className="py-4 px-2 text-sm text-on-surface">{p.type}</td>
                  <td className="py-4 px-2">
                    <Badge tone={propertyStatusTone(p.status)}>{statusLabel(p.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}