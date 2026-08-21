"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddUserModal } from "@/components/users/add-user-modal";
import { MOCK_USERS, PERMISSION_MATRIX, Role, OpsUser } from "@/lib/mock-data";
import { userStatusTone } from "@/lib/status-tones";

const ROLES: Role[] = ["Admin", "Manager", "Staff"];

export default function UsersPage() {
  const [users, setUsers] = useState<OpsUser[]>(MOCK_USERS);
  const [modalOpen, setModalOpen] = useState(false);

  function handleAdd(data: { name: string; department: string; role: Role }) {
    const newUser: OpsUser = {
      id: String(Date.now()),
      name: data.name,
      department: data.department || "—",
      role: data.role,
      status: "Active", // simplified for mock data; real flow would be "Pending" until activation
    };
    setUsers((prev) => [newUser, ...prev]);
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
                <td className="py-4 px-2 text-sm text-on-surface-variant">{u.department}</td>
                <td className="py-4 px-2 text-sm text-on-surface-variant">{u.role}</td>
                <td className="py-4 px-2"><Badge tone={userStatusTone(u.status)}>{u.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
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