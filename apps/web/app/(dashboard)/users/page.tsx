"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddUserModal } from "@/components/users/add-user-modal";
import { fetchUsers, createUser, ApiUser } from "@/lib/api/users";
import { PERMISSION_MATRIX, Role } from "@/lib/mock-data";

const ROLES: Role[] = ["Admin", "Manager", "Staff"];

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
  const [lastActivationLink, setLastActivationLink] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function handleAdd(data: { name: string; email: string; department: string; role: Role }) {
    const result = await createUser({
      name: data.name,
      email: data.email,
      department: data.department,
      role: data.role.toUpperCase() as ApiUser["role"],
    });
    const link = `${window.location.origin}/activate?token=${result.activationToken}`;
    setLastActivationLink({ email: data.email, link });
    setCopied(false);
    await loadUsers();
  }

  function copyLink() {
    if (!lastActivationLink) return;
    navigator.clipboard.writeText(lastActivationLink.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Wrapped title with gold accent line */}
        <div>
          <div className="w-10 h-1 bg-gold rounded-full mb-3" />
          <h1 className="font-serif text-3xl text-primary">Users</h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          + Add user
        </button>
      </div>

      {lastActivationLink && (
        <div className="bg-status-progress-bg border border-status-progress-text/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-status-progress-text">
              User created: {lastActivationLink.email}
            </p>
            <p className="text-xs text-status-progress-text/80 mt-1">
              Share this activation link with them to let them set a password.
            </p>
          </div>
          <button
            onClick={copyLink}
            className="bg-white border border-status-progress-text/30 text-status-progress-text px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-status-progress-bg/50 transition-colors cursor-pointer flex-shrink-0 ml-4"
          >
            {copied ? "Copied ✓" : "Copy activation link"}
          </button>
        </div>
      )}

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
            <button onClick={loadUsers} className="text-sm text-gold underline cursor-pointer">
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
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[640px]">
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
          </div>
        )}
      </Card>

      <Card title="Permission Matrix">
        <p className="text-sm text-on-surface-variant mb-4 -mt-2">
          Default access levels by role across modules. Reference only.
        </p>

        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-surface-container-highest">
                <th className="py-3 px-2 text-xs font-medium text-on-surface-variant uppercase">Module</th>
                {ROLES.map((r) => (
                  <th key={r} className="py-3 px-2 text-xs font-medium text-on-surface-variant uppercase">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {Object.entries(PERMISSION_MATRIX).map(([module, perms]) => (
                <tr key={module}>
                  <td className="py-3 px-2 text-sm text-primary font-medium">{module}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="py-3 px-2 text-sm text-on-surface-variant">
                      {perms[r]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}