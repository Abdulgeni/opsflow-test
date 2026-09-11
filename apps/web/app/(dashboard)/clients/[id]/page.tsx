"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchClient, updateClient, ApiClient, ApiContactLog } from "@/lib/api/clients";
import { clientStatusTone, statusLabel } from "@/lib/status-tones";
import { trackRecentView } from "@/lib/recent";
import { EditClientModal } from "@/components/clients/edit-client-modal";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<(ApiClient & { 
    contactLogs: ApiContactLog[];
    linkedDocuments: any[];
    linkedWorkflows: any[];
    occupancyRecords: any[];
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    fetchClient(id)
      .then((data) => {
        setClient(data);
        trackRecentView(data.name, `/clients/${id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load client"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleArchive() {
    if (!confirm("Are you sure you want to archive this client?")) return;
    setArchiving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("opsflow_token")}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to archive client");
      }
      router.push("/clients");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive client");
      setArchiving(false);
    }
  }

  if (loading) return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  if (error || !client) return <div className="text-sm text-status-negative-text">{error ?? "Client not found."}</div>;

  return (
    <div className="space-y-6">
      <Link href="/clients" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
        ← Back to Clients
      </Link>

      {/* Fixed header to stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-primary">{client.name}</h1>
            <Badge tone={clientStatusTone(client.status)}>{statusLabel(client.status)}</Badge>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {client.type.charAt(0) + client.type.slice(1).toLowerCase()} · {client.email} · {client.phone ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="border border-status-negative-text text-status-negative-text px-4 py-2 rounded-lg text-sm hover:bg-status-negative-bg transition-colors disabled:opacity-50"
          >
            {archiving ? "Archiving…" : "Archive"}
          </button>
        </div>
      </div>

      {/* Fixed grid to stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Contact Log">
            {client.contactLogs.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No contact log entries.</p>
            ) : (
              <div className="space-y-4">
                {client.contactLogs.map((l) => (
                  <div key={l.id} className="pb-3 border-b border-surface-container-highest last:border-0">
                    <p className="text-sm text-on-surface">{l.notes}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Logged by {l.createdBy.name} · {new Date(l.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title="Linked Properties">
            {client.occupancyRecords?.length ? (
              <div className="space-y-2">
                {client.occupancyRecords.map((r: any) => (
                  <Link key={r.id} href={`/properties/${r.property.id}`} className="block text-sm text-primary hover:text-gold transition-colors">
                    {r.property.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No linked properties.</p>
            )}
          </Card>
          <Card title="Linked Documents">
            {client.linkedDocuments?.length ? (
              <div className="space-y-2">
                {client.linkedDocuments.map((d: any) => (
                  <Link key={d.id} href={`/documents/${d.id}`} className="block text-sm text-primary hover:text-gold transition-colors">
                    {d.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No linked documents.</p>
            )}
          </Card>
        </div>
        <Card title="Activity">
          <p className="text-sm text-on-surface-variant">No recent activity.</p>
          <div className="mt-4 flex gap-2">
            <input type="text" placeholder="Add a comment" className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm" />
            <button className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium">Post</button>
          </div>
        </Card>
      </div>

      {client && (
        <EditClientModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={{
            name: client.name,
            email: client.email,
            phone: client.phone ?? "",
          }}
          onSave={async (data) => {
            await updateClient(id, data);
            const updated = await fetchClient(id);
            setClient(updated);
          }}
        />
      )}
    </div>
  );
}