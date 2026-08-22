function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: "ADMIN" | "MANAGER" | "STAFF" | "EXECUTIVE";
  status: "ACTIVE" | "PENDING" | "DEACTIVATED";
  createdAt: string;
}

export async function fetchUsers(): Promise<ApiUser[]> {
  const res = await fetch(`${API_URL}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(data: {
  name: string;
  email: string;
  department?: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "EXECUTIVE";
}) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create user");
  }
  return res.json();
}