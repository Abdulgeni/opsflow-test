export interface ApiLease {
  id: string;
  propertyId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "TERMINATED";
  renewalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    address: string;
    type: string;
    status: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
  };
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Portal (CLIENT) ───────────────────────────────────────────

export async function fetchMyLeases(): Promise<ApiLease[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases/mine`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load your leases");
  return res.json();
}

export async function fetchMyLease(id: string): Promise<ApiLease> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Lease not found, or not yours");
  return res.json();
}

// ─── Internal (staff) ──────────────────────────────────────────

export async function fetchLeases(params?: {
  propertyId?: string;
  clientId?: string;
  status?: string;
}): Promise<ApiLease[]> {
  const qs = new URLSearchParams();
  if (params?.propertyId) qs.set("propertyId", params.propertyId);
  if (params?.clientId) qs.set("clientId", params.clientId);
  if (params?.status) qs.set("status", params.status);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases?${qs}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load leases");
  return res.json();
}

export async function createLease(data: {
  propertyId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create lease");
  }
  return res.json();
}

export async function updateLease(
  id: string,
  data: Partial<{
    startDate: string;
    endDate: string;
    rentAmount: number;
    status: string;
    renewalNotes: string;
  }>
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update lease");
  }
  return res.json();
}