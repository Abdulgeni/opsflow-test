"use client";

import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { OccupancyRow } from "@/lib/api/reports";
import { propertyStatusTone, statusLabel } from "@/lib/status-tones";

// react-table v9 requires features to be registered explicitly. This is a
// plain read-only render — no sorting, filtering, or pagination — so the
// registry is empty and only the automatic core row model is used.
const features = tableFeatures({});
const helper = createColumnHelper<typeof features, OccupancyRow>();

// Declared at module scope so the column defs aren't rebuilt every render.
const columns = helper.columns([
  helper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge tone={propertyStatusTone(info.getValue())}>{statusLabel(info.getValue())}</Badge>
    ),
  }),
  helper.accessor("count", {
    header: "Count",
    cell: (info) => <span className="text-sm text-on-surface tabular-nums">{info.getValue()}</span>,
  }),
  helper.accessor("percentage", {
    header: "Percentage",
    // Whole percents come from the API, so this only has to add the sign.
    cell: (info) => (
      <span className="text-sm text-on-surface tabular-nums">{info.getValue()}%</span>
    ),
  }),
]);

export function OccupancyTable({ rows }: { rows: OccupancyRow[] }) {
  const table = useTable({ features, columns, data: rows });

  return (
    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
      <table className="w-full text-left border-collapse min-w-[320px]">
        <caption className="sr-only">Property count and share by occupancy status</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr
              key={group.id}
              className="border-b border-surface-container-highest bg-surface-container-low/50"
            >
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide"
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-surface-container-highest">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface-bright/50 transition-colors">
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className="py-4 px-2">
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
