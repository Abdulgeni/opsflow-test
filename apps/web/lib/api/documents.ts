function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiDocument {
  id: string;
  title: string;
  category: string;
  linkedTo: string;
  version: number;
  createdAt: string;
  uploadedBy: { name: string };
}

export interface ApiDocumentVersion {
  id: string;
  versionNumber: number;
  note: string | null;
  createdAt: string;
}

export async function fetchDocuments(params: { category?: string; linkedTo?: string; search?: string }): Promise<ApiDocument[]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  );
  const res = await fetch(`${API_URL}/documents?${query}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function fetchDocument(id: string): Promise<ApiDocument & { versions: ApiDocumentVersion[] }> {
  const res = await fetch(`${API_URL}/documents/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function createDocument(data: { title: string; category: string; linkedTo: string }) {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create document");
  }
  return res.json();
}