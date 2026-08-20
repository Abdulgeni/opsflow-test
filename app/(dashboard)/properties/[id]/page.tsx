"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_PROPERTIES, MOCK_MAINTENANCE } from "@/lib/mock-data";
import { propertyStatusTone, maintenanceStatusTone, statusLabel } from "@/lib/status-tones";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const property = MOCK_PROPERTIES.find((p) => p.id === id);
  const maintenance = MOCK_MAINTENANCE.filter((m) => m.propertyId === id);

  if (!property) {
    return <div className="text-sm text-status-negative-text">Property not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-primary">{property.name}</h1>
            <Badge tone={propertyStatusTone(property.status)}>{statusLabel(property.status)}</Badge>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {property.address} · {property.type}
          </p>
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

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Maintenance Requests">
            {maintenance.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No maintenance requests.</p>
            ) : (
              <div className="space-y-3">
                {maintenance.map((m) => (
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
            <input
              type="text"
              placeholder="Add a comment"
              className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            />
            <button className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium">
              Post
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}