"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROUTES = [
  { label: "Properties", href: "/properties" },
  { label: "Clients", href: "/clients" },
  { label: "Documents", href: "/documents" },
  { label: "Workflows", href: "/workflows" },
  { label: "Users", href: "/users" },
  { label: "Reports", href: "/reports" },
  { label: "Executive Summary", href: "/executive" },
  { label: "Settings", href: "/settings" },
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const results = query ? ROUTES.filter((r) => r.label.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="relative flex-1 max-w-sm">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search OpsFlow…"
        className="w-full rounded-lg border border-surface-container-highest px-3 py-1.5 text-sm focus:border-gold focus:ring-gold"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 mt-1 w-full bg-white border border-surface-container-highest rounded-lg shadow-card z-50">
          {results.map((r) => (
            <button
              key={r.href}
              onClick={() => { router.push(r.href); setQuery(""); setOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-container-low"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}