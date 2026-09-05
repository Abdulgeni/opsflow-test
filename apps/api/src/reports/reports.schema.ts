import { z } from "zod";

// Response contract for the property occupancy breakdown (SRS 4.5.1/4.5.3).
// apps/web/lib/api/reports.ts carries its own copy of this shape: the two
// apps deploy independently and neither trusts the other's validation, so
// there is no shared package to hold it. Keep the two in step.
export const OccupancyRowSchema = z.object({
  status: z.string(),
  count: z.number().int().nonnegative(),
});

export const OccupancyResponseSchema = z.array(OccupancyRowSchema);

export type OccupancyRow = z.infer<typeof OccupancyRowSchema>;
export type OccupancyResponse = z.infer<typeof OccupancyResponseSchema>;
