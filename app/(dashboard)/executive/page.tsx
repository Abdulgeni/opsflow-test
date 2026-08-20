export default function ExecutiveSummaryPage() {
  const flaggedItems = [
    { title: "Lease Agreement - Alpha Towers", reason: "Stalled 7 business days in current stage" },
    { title: "Property: West End Plaza", reason: "Under maintenance 12 days" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Executive Summary</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          High-level overview of operational metrics and flagged items.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Properties", value: "124" },
          { label: "Active Clients", value: "87" },
          { label: "Open Workflows", value: "19" },
          { label: "Completion Rate", value: "72%" },
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
          <div className="space-y-4">
            {flaggedItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between pb-3 border-b border-surface-container-highest last:border-0">
                <div>
                  <p className="text-sm font-medium text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{item.reason}</p>
                </div>
                <span className="text-xs bg-status-warning-bg text-status-warning-text px-2.5 py-1 rounded-full">
                  Attention
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
          <h2 className="font-serif text-xl text-primary mb-4">Add a Note</h2>
          <textarea
            placeholder="Log a decision on the selected item..."
            rows={4}
            className="w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm resize-none"
          />
          <button className="mt-3 bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}