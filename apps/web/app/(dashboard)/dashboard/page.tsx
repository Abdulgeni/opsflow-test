"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentViews } from "@/lib/recent";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Summary {
  properties: number;
  activeClients: number;
  documents: number;
  openWorkflows: number;
  completionRate: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [userName, setUserName] = useState("");
  const [recent, setRecent] = useState<{ label: string; href: string }[]>([]);

  useEffect(() => {
    setRecent(getRecentViews());

    const stored = localStorage.getItem("opsflow_user");
    if (stored) setUserName(JSON.parse(stored).name ?? "");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/executive/summary`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  const cards = [
    { label: "Properties", href: "/properties", value: summary?.properties },
    { label: "Active Clients", href: "/clients", value: summary?.activeClients },
    { label: "Documents", href: "/documents", value: summary?.documents },
    { label: "Open Workflows", href: "/workflows", value: summary?.openWorkflows },
  ];

  return (
    <div className="space-y-6">
      <div>
        {/* Added gold accent line above the title */}
        <div className="w-10 h-1 bg-gold rounded-full mb-3" />
        <h1 className="font-serif text-3xl text-primary">Welcome back{userName ? `, ${userName}` : ""}</h1>
        <p className="text-sm text-on-surface-variant mt-1">Here's a quick overview of OpsFlow.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="hover-lift bg-white rounded-lg border border-surface-container-highest shadow-card p-5 hover:border-gold"
          >
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">{c.label}</p>
            <p className="font-serif text-3xl text-primary mt-2">{c.value ?? "—"}</p>
            <p className="text-xs text-gold mt-2">View all →</p>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="font-serif text-lg text-primary mb-3">Recently Viewed</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="text-sm bg-white border border-surface-container-highest rounded-full px-3 py-1.5 hover:border-gold transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link href="/properties" className="bg-charcoal text-white rounded-lg p-5 hover:bg-primary-container transition-colors">
          <p className="font-serif text-lg">+ Add a property</p>
          <p className="text-sm text-white/70 mt-1">Register a new property in the system.</p>
        </Link>
        <Link href="/clients" className="bg-white border border-surface-container-highest rounded-lg p-5 hover:border-gold transition-colors">
          <p className="font-serif text-lg text-primary">+ Add a client</p>
          <p className="text-sm text-on-surface-variant mt-1">Add a new lead or organization.</p>
        </Link>
      </div>
    </div>
  );
}