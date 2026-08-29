"use client";

import { useState } from "react";
import { Role } from "@/lib/mock-data";

export function AddUserModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; email: string; department: string; role: Role }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<Role>("Staff");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email) {
      setError("Name and email are required");
      return;
    }
    onAdd({ name, email, department, role });
    setName("");
    setEmail("");
    setDepartment("");
    setRole("Staff");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-card p-8 w-full max-w-md">
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
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add user
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}