"use client";

import { useEffect, useState } from "react";
import {
  fetchSummary,
  fetchFlags,
  fetchNotes,
  addNote,
  ExecutiveSummary,
  ExecutiveFlag,
  ExecutiveNote,
} from "@/lib/api/executive";

export default function ExecutiveSummaryPage() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [flags, setFlags] = useState<ExecutiveFlag[]>([]);
  const [notes, setNotes] = useState<ExecutiveNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [selectedFlag, setSelectedFlag] = useState<string>("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, f, n] = await Promise.all([fetchSummary(), fetchFlags(), fetchNotes()]);
      setSummary(s);
      setFlags(f);
      setNotes(n);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load executive summary");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!noteText.trim()) return;
    await addNote(selectedFlag || "general", noteText.trim());
    setNoteText("");
    await load();
  }

  if (loading) return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  if (error) return <div className="text-sm text-status-negative-text">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        {/* Added gold accent line above the title */}
        <div className="w-10 h-1 bg-gold rounded-full mb-3" />
        <h1 className="font-serif text-3xl text-primary">Executive Summary</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          High-level overview of operational metrics and flagged items.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Properties", value: summary?.properties ?? 0 },
          { label: "Active Clients", value: summary?.activeClients ?? 0 },
          { label: "Open Workflows", value: summary?.openWorkflows ?? 0 },
          { label: "Completion Rate", value: `${summary?.completionRate ?? 0}%` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-surface-container-highest shadow-card p-5">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">{kpi.label}</p>
            <p className="font-serif text-3xl text-primary mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
          <h2 className="font-serif text-xl text-primary mb-4">Flagged Items</h2>
          {flags.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nothing flagged right now.</p>
          ) : (
            <div className="space-y-4">
              {flags.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedFlag(item.id)}
                  className={`w-full text-left flex items-center justify-between pb-3 border-b border-surface-container-highest last:border-0 ${
                    selectedFlag === item.id ? "opacity-100" : "opacity-90 hover:opacity-100"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-on-surface">{item.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{item.reason}</p>
                  </div>
                  <span className="text-xs bg-status-warning-bg text-status-warning-text px-2.5 py-1 rounded-full">
                    Attention
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
          <h2 className="font-serif text-xl text-primary mb-4">Add a Note</h2>
          {selectedFlag && (
            <p className="text-xs text-on-surface-variant mb-2">
              Logging against: {flags.find((f) => f.id === selectedFlag)?.title ?? selectedFlag}
            </p>
          )}
          <textarea
            placeholder="Log a decision on the selected item..."
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm resize-none focus:border-gold focus:ring-gold"
          />
          <button
            onClick={handleSave}
            disabled={!noteText.trim()}
            className="mt-3 bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Note
          </button>

          {notes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-surface-container-highest space-y-3">
              <p className="text-xs font-medium text-on-surface-variant uppercase">Logged notes</p>
              {notes.map((n) => (
                <div key={n.id} className="text-sm">
                  <p className="text-on-surface">{n.note}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {n.author.name} · {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}