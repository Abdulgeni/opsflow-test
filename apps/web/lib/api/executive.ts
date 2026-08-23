function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ExecutiveSummary {
  properties: number;
  activeClients: number;
  openWorkflows: number;
  completionRate: number;
}

export interface ExecutiveFlag {
  id: string;
  title: string;
  reason: string;
}

export interface ExecutiveNote {
  id: string;
  linkedTo: string;
  note: string;
  createdAt: string;
  author: { name: string };
}

export async function fetchSummary(): Promise<ExecutiveSummary> {
  const res = await fetch(`${API_URL}/executive/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchFlags(): Promise<ExecutiveFlag[]> {
  const res = await fetch(`${API_URL}/executive/flags`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch flags");
  return res.json();
}

export async function fetchNotes(): Promise<ExecutiveNote[]> {
  const res = await fetch(`${API_URL}/executive/notes`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function addNote(linkedTo: string, note: string) {
  const res = await fetch(`${API_URL}/executive/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ linkedTo, note }),
  });
  if (!res.ok) throw new Error("Failed to save note");
  return res.json();
}