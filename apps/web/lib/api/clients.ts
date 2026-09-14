import { apiFetch } from "./apiFetch";

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

export interface ApiDocument {
  id: string;
  title: string;
  category: string;
  linkedEntityType: string;
  linkedEntityId: string;
  version: number;
  createdAt: string;
}

export interface ApiWorkflow {
  id: string;
  title: string;
  stages: string[];
  currentStageIndex: number;
  createdAt: string;
}

export interface ApiOccupancyRecord {
  id: string;
  property: { id: string; name: string };
}

export async function fetchClients(params: {
  status?: string;
  type?: string;
  search?: string;
  includeArchived?: boolean;
}): Promise<ApiClient[]> {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "" && v !== false)
      .map(([k, v]) => [k, String(v)]) as [string, string][]
  );
  const res = await apiFetch(`/clients?${query}`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function fetchClient(id: string): Promise<ApiClient & {
  contactLogs: ApiContactLog[];
  linkedDocuments: ApiDocument[];
  linkedWorkflows: ApiWorkflow[];
  occupancyRecords: ApiOccupancyRecord[];
}> {
  const res = await apiFetch(`/clients/${id}`);
  if (!res.ok) throw new Error("Failed to fetch client");
  return res.json();
}

export async function createClient(data: { name: string; type: "INDIVIDUAL" | "ORGANIZATION"; email: string; phone?: string }) {
  const res = await apiFetch(`/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create client");
  }
  return res.json();
}

export async function updateClient(
  id: string,
  data: { name: string; email: string; phone: string; type?: string; status?: string }
) {
  const res = await apiFetch(`/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update client");
  return res.json();
}

export async function unarchiveClient(id: string) {
  const res = await apiFetch(`/clients/${id}/unarchive`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to restore client");
  return res.json();
}
