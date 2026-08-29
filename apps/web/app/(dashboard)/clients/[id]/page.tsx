"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchClient, ApiClient, ApiContactLog } from "@/lib/api/clients";
import { clientStatusTone, statusLabel } from "@/lib/status-tones";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<(ApiClient & { contactLogs: ApiContactLog[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClient(id)
      .then(setClient)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load client"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  if (error || !client) return <div className="text-sm text-status-negative-text">{error ?? "Client not found."}</div>;

  return (
    <div className="space-y-6">
      <Link href="/clients" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
        ← Back to Clients
      </Link>

      <div className="flex items-start justify-between">
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
          <button className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">Edit</button>
          <button className="border border-status-negative-text text-status-negative-text px-4 py-2 rounded-lg text-sm hover:bg-status-negative-bg transition-colors">Archive</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
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
            <p className="text-sm text-on-surface-variant">No linked properties.</p>
          </Card>
          <Card title="Linked Documents">
            <p className="text-sm text-on-surface-variant">No linked documents.</p>
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
    </div>
  );
}