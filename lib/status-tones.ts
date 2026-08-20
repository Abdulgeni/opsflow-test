export function propertyStatusTone(status: string) {
  switch (status) {
    case "AVAILABLE": return "positive" as const;
    case "OCCUPIED": return "progress" as const;
    case "UNDER_MAINTENANCE": return "warning" as const;
    case "DECOMMISSIONED": return "inactive" as const;
    default: return "inactive" as const;
  }
}

export function clientStatusTone(status: string) {
  switch (status) {
    case "LEAD": return "progress" as const;
    case "ACTIVE": return "positive" as const;
    case "INACTIVE": return "inactive" as const;
    case "ARCHIVED": return "inactive" as const;
    default: return "inactive" as const;
  }
}

export function maintenanceStatusTone(status: string) {
  switch (status) {
    case "OPEN": return "warning" as const;
    case "IN_PROGRESS": return "progress" as const;
    case "RESOLVED": return "positive" as const;
    default: return "inactive" as const;
  }
}

export function userStatusTone(status: string) {
  return status === "Active" ? ("positive" as const) : ("inactive" as const);
}

export function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}