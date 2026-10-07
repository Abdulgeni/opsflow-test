"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { fetchMyLeases, ApiLease } from "@/lib/api/leases";

type Tone = "positive" | "progress" | "warning" | "inactive" | "negative";

function leaseStatusTone(status: ApiLease["status"]): Tone {
  switch (status) {
    case "ACTIVE":
      return "positive";
    case "PENDING":
      return "progress";
    case "EXPIRED":
      return "inactive";
    case "TERMINATED":
      return "negative";
    default:
      return "inactive";
  }
}

export default function PortalHomePage() {
  const [leases, setLeases] = useState<ApiLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("opsflow_user") : null;
    if (stored) {
      try {
        setUserName(JSON.parse(stored).name ?? "");
      } catch {
        /* ignore malformed storage */
      }
    }

    fetchMyLeases()
      .then(setLeases)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load leases"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="w-10 h-1 bg-gold rounded-full mb-3" />
        <h1 className="font-serif text-3xl text-primary">
          Welcome{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Here are your current and past leases.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-surface-container-highest p-8 text-center">
          <p className="text-sm text-status-negative-text">{error}</p>
        </div>
      )}

      {!loading && !error && leases.length === 0 && (
        <div className="bg-white rounded-lg border border-surface-container-highest p-8 text-center">
          <p className="text-sm text-on-surface-variant">
            No leases are currently linked to your account.
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            If you believe this is a mistake, please contact your property manager.
          </p>
        </div>
      )}

      {!loading && !error && leases.length > 0 && (
        <div className="space-y-4">
          {leases.map((l) => (
            <Link
              key={l.id}
              href={`/portal/leases/${l.id}`}
              className="block bg-white rounded-lg border border-surface-container-highest shadow-card p-5 hover:border-gold transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif text-lg text-primary">{l.property.name}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{l.property.address}</p>
                </div>
                <Badge tone={leaseStatusTone(l.status)}>{l.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm text-on-surface-variant">
                <span>
                  {new Date(l.startDate).toLocaleDateString()} –{" "}
                  {new Date(l.endDate).toLocaleDateString()}
                </span>
                <span className="font-medium text-on-surface">
                  ${l.rentAmount.toLocaleString()}/mo
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}