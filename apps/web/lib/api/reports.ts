import { z } from "zod";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mirror of apps/api/src/reports/reports.schema.ts. Kept as its own copy on
// purpose — the two apps deploy independently and neither trusts the other's
// validation. Keep the two in step.
export const OccupancyRowSchema = z.object({
  status: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
});

export const OccupancyResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  breakdown: z.array(OccupancyRowSchema),
});

export type OccupancyRow = z.infer<typeof OccupancyRowSchema>;
export type OccupancyResponse = z.infer<typeof OccupancyResponseSchema>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// The occupancy breakdown is Admin/Manager only, so a 403 is an expected
// outcome for Staff rather than a failure worth retrying or alarming about.
export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

export async function fetchOccupancy(): Promise<OccupancyResponse> {
  const res = await fetch(`${API_URL}/reports/properties/occupancy`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? "Failed to fetch property occupancy", res.status);
  }
  return OccupancyResponseSchema.parse(await res.json());
}
