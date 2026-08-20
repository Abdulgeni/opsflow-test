"use client";

import { Card } from "@/components/ui/card";

const CHART_DATA = [
  { week: "Week 1", value: 58 },
  { week: "Week 2", value: 72 },
  { week: "Week 3", value: 79 },
  { week: "Week 4", value: 85 },
];

export default function ReportsPage() {
  const maxValue = 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Analytics</h1>
        <select className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Properties", value: "124" },
          { label: "Active Clients", value: "87" },
          { label: "Open Workflows", value: "19" },
          { label: "Documents", value: "342" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-surface-container-highest shadow-card p-5">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">{kpi.label}</p>
            <p className="font-serif text-3xl text-primary mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <Card title="Workflow Completion Rate">
        <div className="h-64 flex items-end gap-8 px-4 pt-8 relative">
          {/* Gridlines */}
          {[0, 25, 50, 75, 100].map((v) => (
            <div
              key={v}
              className="absolute left-0 right-0 border-t border-surface-container-highest text-xs text-on-surface-variant"
              style={{ bottom: `${(v / maxValue) * 100}%` }}
            >
              <span className="absolute -left-8 -top-2">{v}%</span>
            </div>
          ))}

          {/* Simple bar-style representation (safe, no external chart library needed) */}
          <div className="flex items-end justify-between w-full h-full relative z-10">
            {CHART_DATA.map((point) => (
              <div key={point.week} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-medium text-primary">{point.value}%</span>
                <div
                  className="w-12 bg-gold rounded-t"
                  style={{ height: `${(point.value / maxValue) * 180}px` }}
                />
                <span className="text-xs text-on-surface-variant">{point.week}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">
            Export CSV
          </button>
        </div>
      </Card>
    </div>
  );
}