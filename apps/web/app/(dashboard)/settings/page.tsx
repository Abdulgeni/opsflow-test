"use client";

import { useEffect, useState } from "react";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("opsflow_user");
    if (stored) {
      const u = JSON.parse(stored);
      setName(u.name ?? "");
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, phone, department }),
      });
      if (!res.ok) throw new Error("Failed to save changes");

      const stored = localStorage.getItem("opsflow_user");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("opsflow_user", JSON.stringify({ ...u, name }));
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Wrapped title with gold accent line */}
      <div>
        <div className="w-10 h-1 bg-gold rounded-full mb-3" />
        <h1 className="font-serif text-3xl text-primary">Settings</h1>
      </div>
      <p className="text-sm text-on-surface-variant">
        Update your own profile details. Your role can only be changed by an administrator.
      </p>

      {saved && (
        <div className="rounded-lg bg-status-positive-bg text-status-positive-text px-4 py-3 text-sm">
          Changes saved.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
          />
        </div>
        <button
          type="submit"
          className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}