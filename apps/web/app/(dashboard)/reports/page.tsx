"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

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

interface Snapshot {
  id: string;
  completionRate: number;
  capturedAt: string;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, historyRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/executive/summary`, { headers: authHeaders() }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/history`, { headers: authHeaders() }),
        ]);
        if (!summaryRes.ok || !historyRes.ok) throw new Error("Failed to load analytics");
        setSummary(await summaryRes.json());
        setHistory(await historyRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleExport() {
    if (!summary) return;
    const csvContent = `Metric,Value\nProperties,${summary.properties}\nActive Clients,${summary.activeClients}\nDocuments,${summary.documents}\nOpen Workflows,${summary.openWorkflows}\nCompletion Rate,${summary.completionRate}%`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "opsflow-analytics.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  if (error || !summary) return <div className="text-sm text-status-negative-text">{error ?? "No data."}</div>;

  const maxValue = 100;

  return (
    <div className="space-y-6">
      {/* Wrapped title with gold accent line */}
      <div>
        <div className="w-10 h-1 bg-gold rounded-full mb-3" />
        <h1 className="font-serif text-3xl text-primary">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Properties", value: summary.properties },
          { label: "Active Clients", value: summary.activeClients },
          { label: "Open Workflows", value: summary.openWorkflows },
          { label: "Documents", value: summary.documents },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-surface-container-highest shadow-card p-5">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">{kpi.label}</p>
            <p className="font-serif text-3xl text-primary mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <Card title="Workflow Completion Rate">
        {history.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            No historical data yet — snapshots are captured daily. Check back after a few days.
          </p>
        ) : (
          <div className="h-64 flex items-end gap-4 px-4 pt-8 relative overflow-x-auto">
            {[0, 25, 50, 75, 100].map((v) => (
              <div
                key={v}
                className="absolute left-0 right-0 border-t border-surface-container-highest text-xs text-on-surface-variant"
                style={{ bottom: `${(v / maxValue) * 100}%` }}
              >
                <span className="absolute -left-8 -top-2">{v}%</span>
              </div>
            ))}
            <div className="flex items-end justify-between w-full h-full relative z-10 gap-2">
              {history.map((snap) => (
                <div key={snap.id} className="flex flex-col items-center gap-2 flex-1 min-w-[40px]">
                  <span className="text-xs font-medium text-primary">{snap.completionRate}%</span>
                  <div
                    className="w-8 bg-gold rounded-t"
                    style={{ height: `${(snap.completionRate / maxValue) * 180}px` }}
                  />
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(snap.capturedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleExport}
            className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors"
          >
            Export CSV
          </button>
        </div>
      </Card>
    </div>
  );
}