"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddUserModal } from "@/components/users/add-user-modal";
import { fetchUsers, createUser, ApiUser } from "@/lib/api/users";
import { PERMISSION_MATRIX, Role } from "@/lib/mock-data";

const ROLES: Role[] = ["Admin", "Manager", "Staff"];

// Backend roles are UPPERCASE (ADMIN), frontend/mock roles are Title Case
// (Admin) — this maps between the two until we unify the types.
function displayRole(role: ApiUser["role"]): Role {
  return (role.charAt(0) + role.slice(1).toLowerCase()) as Role;
}

function displayStatus(status: ApiUser["status"]) {
  if (status === "ACTIVE") return "Active";
  if (status === "PENDING") return "Pending";
  return "Deactivated";
}

function statusTone(status: ApiUser["status"]) {
  if (status === "ACTIVE") return "positive" as const;
  if (status === "PENDING") return "warning" as const;
  return "inactive" as const;
}

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleAdd(data: { name: string; department: string; role: Role }) {
    await createUser({
      name: data.name,
      email: `${data.name.toLowerCase().replace(/\s+/g, ".")}@goldenage.com`,
      department: data.department,
      role: data.role.toUpperCase() as ApiUser["role"],
    });
    await loadUsers(); // refetch so the list reflects the real database
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Users</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add user
        </button>
      </div>

      <Card>
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-surface-container-low rounded" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-sm text-status-negative-text mb-2">{error}</p>
            <button onClick={loadUsers} className="text-sm text-gold underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant">No users yet.</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                {["Name", "Department", "Role", "Status"].map((h) => (
                  <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-primary font-medium">{u.name}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{u.department ?? "—"}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{displayRole(u.role)}</td>
                  <td className="py-4 px-2">
                    <Badge tone={statusTone(u.status)}>{displayStatus(u.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Permission Matrix">
        <p className="text-sm text-on-surface-variant mb-4 -mt-2">
          Default access levels by role across modules. Reference only.
        </p>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container-highest">
              <th className="py-3 px-2 text-xs font-medium text-on-surface-variant uppercase">Module</th>
              {ROLES.map((r) => (
                <th key={r} className="py-3 px-2 text-xs font-medium text-on-surface-variant uppercase">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest">
            {Object.entries(PERMISSION_MATRIX).map(([module, perms]) => (
              <tr key={module}>
                <td className="py-3 px-2 text-sm text-primary font-medium">{module}</td>
                {ROLES.map((r) => (
                  <td key={r} className="py-3 px-2 text-sm text-on-surface-variant">{perms[r]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}