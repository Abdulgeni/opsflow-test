"use client";

import { useEffect, useState } from "react";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Entity {
  id: string;
  name: string;
}

export function EntityPicker({
  entityType,
  entityId,
  onChange,
}: {
  entityType: string;
  entityId: string;
  onChange: (type: string, id: string) => void;
}) {
  const [properties, setProperties] = useState<Entity[]>([]);
  const [clients, setClients] = useState<Entity[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setProperties(data.items ?? data));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setClients);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        value={entityType}
        onChange={(e) => onChange(e.target.value, "")}
        className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
      >
        <option value="">Link to…</option>
        <option value="Property">Property</option>
        <option value="Client">Client</option>
      </select>
      <select
        value={entityId}
        onChange={(e) => onChange(entityType, e.target.value)}
        disabled={!entityType}
        className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm disabled:bg-surface-container-low disabled:cursor-not-allowed"
      >
        <option value="">Select…</option>
        {(entityType === "Property" ? properties : entityType === "Client" ? clients : []).map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>
    </div>
  );
}