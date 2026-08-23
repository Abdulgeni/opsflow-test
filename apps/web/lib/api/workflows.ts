function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiWorkflow {
  id: string;
  title: string;
  stages: string[];
  currentStageIndex: number;
  createdAt: string;
}

export interface ApiTransition {
  id: string;
  fromStage: string;
  toStage: string;
  comment: string | null;
  createdAt: string;
  actor: { name: string };
}

export interface ApiWorkflowComment {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
}

export async function fetchWorkflows(): Promise<ApiWorkflow[]> {
  const res = await fetch(`${API_URL}/workflows`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch workflows");
  return res.json();
}

export async function fetchWorkflow(id: string): Promise<ApiWorkflow & { transitions: ApiTransition[]; comments: ApiWorkflowComment[] }> {
  const res = await fetch(`${API_URL}/workflows/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch workflow");
  return res.json();
}
export async function createWorkflow(data: { title: string; stages: string[]; linkedTo?: string }) {
  const res = await fetch(`${API_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create workflow");
  }
  return res.json();
}

export async function advanceWorkflow(id: string, comment?: string) {
  const res = await fetch(`${API_URL}/workflows/${id}/advance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to advance workflow");
  }
  return res.json();
}

export async function rejectWorkflow(id: string, comment?: string) {
  const res = await fetch(`${API_URL}/workflows/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to reject workflow");
  }
  return res.json();
}

export async function addWorkflowComment(id: string, body: string) {
  const res = await fetch(`${API_URL}/workflows/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}