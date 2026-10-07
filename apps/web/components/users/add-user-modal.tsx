"use client";

import { useEffect, useState } from "react";
import { Role } from "@/lib/mock-data";
import { fetchClients, ApiClient } from "@/lib/api/clients";

export function AddUserModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    email: string;
    department: string;
    role: Role;
    clientId?: string;
  }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<Role>("Staff");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load clients lazily — only when the modal is open and role is Client.
  useEffect(() => {
    if (!open || role !== "Client") return;
    if (clients.length > 0) return;
    setClientsLoading(true);
    fetchClients({})
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false));
  }, [open, role, clients.length]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email) {
      setError("Name and email are required");
      return;
    }
    if (role === "Client" && !clientId) {
      setError("Please select which client this portal user belongs to");
      return;
    }
    setLoading(true);
    try {
      await onAdd({ name, email, department, role, clientId: role === "Client" ? clientId : undefined });
      setName("");
      setEmail("");
      setDepartment("");
      setRole("Staff");
      setClientId("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-in fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal-in bg-white rounded-xl shadow-card p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <h2 className="font-serif text-2xl text-primary mb-1">Add user</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          New users are created with Pending status until they activate their account.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="their.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={role === "Client"}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold disabled:bg-surface-container-low disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role);
                setClientId("");
              }}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Client">Client (portal access)</option>
            </select>
          </div>

          {role === "Client" && (
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Linked client record
              </label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={clientsLoading}
                className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">
                  {clientsLoading ? "Loading clients…" : "Select a client…"}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant mt-1">
                This portal user will only see leases and documents linked to this client.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Adding…" : "Add user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}