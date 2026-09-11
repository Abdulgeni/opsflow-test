"use client";

import { useEffect, useState } from "react";
import { getTheme, setTheme } from "@/lib/theme";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [browserNotifs, setBrowserNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("opsflow_user");
    if (stored) {
      const u = JSON.parse(stored);
      setName(u.name ?? "");
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotifs(window.Notification.permission === "granted");
    }
    setDarkMode(getTheme() === "dark");
    setEmailNotifsEnabled(localStorage.getItem("opsflow_email_notifs") !== "false");
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, phone, department }),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      const stored = localStorage.getItem("opsflow_user");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("opsflow_user", JSON.stringify({ ...u, name }));
      }
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to change password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }

  function requestBrowserNotifs() {
    if (typeof window !== "undefined" && "Notification" in window) {
      window.Notification.requestPermission().then((perm) => {
        setBrowserNotifs(perm === "granted");
      });
    }
  }

  function toggleDarkModeSetting() {
    const next = darkMode ? "light" : "dark";
    setTheme(next);
    setDarkMode(next === "dark");
  }

  function toggleEmailNotifs() {
    const next = !emailNotifsEnabled;
    setEmailNotifsEnabled(next);
    localStorage.setItem("opsflow_email_notifs", String(next));
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="font-serif text-3xl text-primary">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <h2 className="font-serif text-xl text-primary mb-4">Profile</h2>
        {profileSaved && (
          <div className="mb-4 rounded-lg bg-status-positive-bg text-status-positive-text px-4 py-3 text-sm">
            Profile updated.
          </div>
        )}
        {profileError && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {profileError}
          </div>
        )}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
          <button type="submit" className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
            Save profile
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <h2 className="font-serif text-xl text-primary mb-4">Change Password</h2>
        {passwordSaved && (
          <div className="mb-4 rounded-lg bg-status-positive-bg text-status-positive-text px-4 py-3 text-sm">
            Password changed successfully.
          </div>
        )}
        {passwordError && (
          <div className="mb-4 rounded-lg bg-status-negative-bg text-status-negative-text px-4 py-3 text-sm">
            {passwordError}
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Current password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">New password</label>
            <input
              type="password"
              required
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Confirm new password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-surface-container-highest px-3 py-2 text-sm focus:border-gold focus:ring-gold"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {passwordLoading ? "Changing…" : "Change password"}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <h2 className="font-serif text-xl text-primary mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface">Dark mode</p>
            <p className="text-xs text-on-surface-variant mt-1">Switch between light and dark themes.</p>
          </div>
          <button
            onClick={toggleDarkModeSetting}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-gold" : "bg-surface-container-highest"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-surface-container-highest shadow-card p-6">
        <h2 className="font-serif text-xl text-primary mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface">Browser notifications</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Get notified even when OpsFlow isn't in focus.
              </p>
            </div>
            {browserNotifs ? (
              <span className="text-xs bg-status-positive-bg text-status-positive-text px-3 py-1.5 rounded-full">Enabled</span>
            ) : (
              <button onClick={requestBrowserNotifs} className="bg-gold text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Enable
              </button>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-surface-container-highest">
            <div>
              <p className="text-sm text-on-surface">In-app notification badge</p>
              <p className="text-xs text-on-surface-variant mt-1">Show the unread dot on the bell icon.</p>
            </div>
            <button
              onClick={toggleEmailNotifs}
              className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifsEnabled ? "bg-gold" : "bg-surface-container-highest"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${emailNotifsEnabled ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}