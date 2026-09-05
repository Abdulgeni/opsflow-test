"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOccupancy, isForbidden, type OccupancyRow } from "@/lib/api/reports";

export function useOccupancy() {
  return useQuery<OccupancyRow[]>({
    queryKey: ["analytics", "properties", "occupancy"],
    queryFn: fetchOccupancy,
    // A 403 means the signed-in role isn't allowed to see the breakdown at
    // all — retrying can't change that, so surface it immediately.
    retry: (failureCount, error) => !isForbidden(error) && failureCount < 2,
  });
}
