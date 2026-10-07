"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { fetchMyLease, ApiLease } from "@/lib/api/leases";

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

export default function PortalLeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lease, setLease] = useState<ApiLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchMyLease(id)
      .then(setLease)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load lease"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 bg-surface-container-low rounded animate-pulse" />
        <div className="h-64 bg-surface-container-low rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="space-y-6">
        <Link href="/portal" className="text-sm text-on-surface-variant hover:text-gold">
          ← Back to My Leases
        </Link>
        <div className="bg-white rounded-lg border border-surface-container-highest p-8 text-center">
          <p className="text-sm text-status-negative-text">
            {error ?? "Lease not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/portal" className="text-sm text-on-surface-variant hover:text-gold">
        ← Back to My Leases
      </Link>

      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-primary">{lease.property.name}</h1>
            <p className="text-sm text-on-surface-variant mt-1">{lease.property.address}</p>
          </div>
          <Badge tone={leaseStatusTone(lease.status)}>{lease.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-surface-container-highest">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Start Date</p>
            <p className="text-sm font-medium text-on-surface mt-1">
              {new Date(lease.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">End Date</p>
            <p className="text-sm font-medium text-on-surface mt-1">
              {new Date(lease.endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Monthly Rent</p>
            <p className="text-sm font-medium text-on-surface mt-1">
              ${lease.rentAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Property Type</p>
            <p className="text-sm font-medium text-on-surface mt-1">{lease.property.type}</p>
          </div>
        </div>

        {lease.renewalNotes && (
          <div className="mt-6 pt-6 border-t border-surface-container-highest">
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Renewal Notes</p>
            <p className="text-sm text-on-surface mt-2 whitespace-pre-wrap">{lease.renewalNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}