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

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface LeaseDocument {
  id: string;
  title: string;
  category: string;
  version: number;
  createdAt: string;
}

export default function PortalLeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lease, setLease] = useState<ApiLease | null>(null);
  const [leaseDocs, setLeaseDocs] = useState<LeaseDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchMyLease(id)
      .then(setLease)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load lease"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases/${id}/documents`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setLeaseDocs)
      .catch(() => setLeaseDocs([]))
      .finally(() => setDocsLoading(false));
  }, [id]);

  async function handleDownload(docId: string) {
    setDownloadingId(docId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/mine/${docId}/download-url`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Download unavailable");
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
    } catch {
      alert("Unable to download this document right now.");
    } finally {
      setDownloadingId(null);
    }
  }

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
          <p className="text-sm text-status-negative-text">{error ?? "Lease not found"}</p>
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
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">
              Renewal Notes
            </p>
            <p className="text-sm text-on-surface mt-2 whitespace-pre-wrap">
              {lease.renewalNotes}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <h2 className="font-serif text-xl text-primary mb-4">Documents for this property</h2>
        {docsLoading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-10 bg-surface-container-low rounded" />
            <div className="h-10 bg-surface-container-low rounded" />
          </div>
        )}
        {!docsLoading && leaseDocs.length === 0 && (
          <p className="text-sm text-on-surface-variant">
            No documents linked to this property yet.
          </p>
        )}
        {!docsLoading && leaseDocs.length > 0 && (
          <div className="space-y-2">
            {leaseDocs.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-2 border-b border-surface-container-highest last:border-0"
              >
                <div>
                  <p className="text-sm text-on-surface">{d.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {d.category} · v{d.version}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(d.id)}
                  disabled={downloadingId === d.id}
                  className="text-sm text-gold hover:underline disabled:opacity-50"
                >
                  {downloadingId === d.id ? "Opening…" : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}