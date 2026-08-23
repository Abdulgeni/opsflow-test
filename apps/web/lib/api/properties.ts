function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiProperty {
  id: string;
  name: string;
  address: string;
  type: string;
  status: "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE" | "DECOMMISSIONED";
}

export interface ApiMaintenanceRequest {
  id: string;
  propertyId: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
}

export async function fetchProperties(params: { status?: string; type?: string; search?: string }): Promise<ApiProperty[]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  );
  const res = await fetch(`${API_URL}/properties?${query}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch properties");
  return res.json();
}

export async function fetchProperty(id: string): Promise<ApiProperty & { maintenanceRequests: ApiMaintenanceRequest[] }> {
  const res = await fetch(`${API_URL}/properties/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch property");
  return res.json();
}

export async function createProperty(data: { name: string; address: string; type: string }) {
  const res = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create property");
  }
  return res.json();
}