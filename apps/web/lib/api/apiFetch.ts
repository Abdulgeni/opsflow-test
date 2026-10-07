export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has ended. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("opsflow_token")
      : null;

  const headers: HeadersInit = {
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("opsflow_token");
      window.location.href = "/sign-in";
    }
    throw new SessionExpiredError();
  }

  return res;
}
