export function propertyStatusTone(status: string) {
  switch (status) {
    case "AVAILABLE": return "positive" as const;
    case "OCCUPIED": return "progress" as const;
    case "UNDER_MAINTENANCE": return "warning" as const;
    case "DECOMMISSIONED": return "inactive" as const;
    default: return "inactive" as const;
  }
}

export function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}