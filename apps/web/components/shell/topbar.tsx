"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getTheme, setTheme } from "@/lib/theme";
import { SearchBar } from "./search-bar";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

export function TopBar() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const helpRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("opsflow_user");
    if (stored) setUser(JSON.parse(stored));
    setDarkMode(getTheme() === "dark");
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markRead(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function toggleDarkMode() {
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    setDarkMode(next === "dark");
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 border-b border-surface-container-highest bg-white flex items-center justify-between gap-4 px-4 md:px-8 flex-shrink-0 relative">
      <SearchBar />

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors overflow-hidden"
        >
          <span className={`inline-block transition-transform duration-500 ${darkMode ? "rotate-180" : "rotate-0"}`}>
            {darkMode ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </span>
        </button>

        <div ref={helpRef} className="relative">
          <button
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="Help"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            ?
          </button>
          {helpOpen && (
            <div className="dropdown-in absolute right-0 mt-2 w-64 bg-white border border-surface-container-highest rounded-lg shadow-card p-4 z-50">
              <p className="text-sm font-medium text-on-surface mb-2">Need help?</p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=abdulgeniabdulaziz@gmail.com&su=OpsFlow%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Contact support
                  </a>
                </li>
                <li><span>Version: OpsFlow v1.0</span></li>
              </ul>
            </div>
          )}
        </div>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="pulse-dot absolute top-1 right-1 w-2 h-2 bg-status-negative-text rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="dropdown-in absolute right-0 mt-2 w-80 bg-white border border-surface-container-highest rounded-lg shadow-card z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-surface-container-highest">
                <p className="text-sm font-medium text-on-surface">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-on-surface-variant p-4">No notifications yet.</p>
              ) : (
                <div className="divide-y divide-surface-container-highest">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left p-4 text-sm hover:bg-surface-container-low transition-colors ${
                        n.isRead ? "text-on-surface-variant" : "text-on-surface font-medium"
                      }`}
                    >
                      <p>{n.message}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm text-on-surface">
              {user?.name?.[0] ?? "U"}
            </span>
            <span className="hidden md:inline text-sm text-on-surface">Profile</span>
          </button>
          {profileOpen && (
            <div className="dropdown-in absolute right-0 mt-2 w-64 bg-white border border-surface-container-highest rounded-lg shadow-card p-4 z-50">
              <p className="text-sm font-medium text-on-surface">{user?.name ?? "Unknown"}</p>
              <p className="text-xs text-on-surface-variant mt-1">{user?.email ?? ""}</p>
              <p className="text-xs text-on-surface-variant mt-1">Role: {user?.role ?? ""}</p>
              <div className="mt-3 pt-3 border-t border-surface-container-highest">
                <Link
                  href="/sign-in"
                  onClick={() => {
                    localStorage.removeItem("opsflow_token");
                    localStorage.removeItem("opsflow_user");
                    document.cookie = "opsflow_token=; path=/; max-age=0";
                  }}
                  className="text-sm text-status-negative-text hover:underline"
                >
                  Sign out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}