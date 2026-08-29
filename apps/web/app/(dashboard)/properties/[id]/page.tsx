"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchProperty, ApiProperty, ApiMaintenanceRequest } from "@/lib/api/properties";
import { propertyStatusTone, maintenanceStatusTone, statusLabel } from "@/lib/status-tones";
import { trackRecentView } from "@/lib/recent";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<(ApiProperty & { maintenanceRequests: ApiMaintenanceRequest[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
    fetchProperty(id)
      .then((data) => {
        setProperty(data);
        trackRecentView(data.name, `/properties/${id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load property"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  }
  if (error || !property) {
    return <div className="text-sm text-status-negative-text">{error ?? "Property not found."}</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/properties" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
        ← Back to Properties
      </Link>

      {/* Fixed header to stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-primary">{property.name}</h1>
            <Badge tone={propertyStatusTone(property.status)}>{statusLabel(property.status)}</Badge>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">{property.address} · {property.type}</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">
            Edit
          </button>
          <button className="border border-status-negative-text text-status-negative-text px-4 py-2 rounded-lg text-sm hover:bg-status-negative-bg transition-colors">
            Archive
          </button>
        </div>
      </div>

      {/* Fixed grid to stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Maintenance Requests">
            {property.maintenanceRequests.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No maintenance requests.</p>
            ) : (
              <div className="space-y-3">
                {property.maintenanceRequests.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-surface-container-highest last:border-0">
                    <span className="text-sm text-on-surface">{m.description}</span>
                    <Badge tone={maintenanceStatusTone(m.status)}>{statusLabel(m.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title="Linked Clients">
            <p className="text-sm text-on-surface-variant">No linked clients.</p>
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