function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiClient {
  id: string;
  name: string;
  type: "INDIVIDUAL" | "ORGANIZATION";
  email: string;
  phone: string | null;
  status: "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface ApiContactLog {
  id: string;
  notes: string;
  createdAt: string;
  createdBy: { name: string };
}

export async function fetchClients(params: { status?: string; type?: string; search?: string }): Promise<ApiClient[]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  );
  const res = await fetch(`${API_URL}/clients?${query}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function fetchClient(id: string): Promise<ApiClient & { contactLogs: ApiContactLog[] }> {
  const res = await fetch(`${API_URL}/clients/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch client");
  return res.json();
}

export async function createClient(data: { name: string; type: "INDIVIDUAL" | "ORGANIZATION"; email: string; phone?: string }) {
  const res = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create client");
  }
  return res.json();
}