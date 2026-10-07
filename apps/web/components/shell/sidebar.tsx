"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Properties", href: "/properties", icon: "▤" },
  { label: "Clients", href: "/clients", icon: "◐" },
  { label: "Leases", href: "/leases", icon: "▣" },
  { label: "Documents", href: "/documents", icon: "▥" },
  { label: "Workflows", href: "/workflows", icon: "⟳" },
  { label: "Users", href: "/users", icon: "◉" },
  { label: "Reports", href: "/reports", icon: "▧" },
  { label: "Executive", href: "/executive", icon: "◆" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // "pinned" = user explicitly wants it expanded (persisted).
  // "hovered" = mouse is currently over the sidebar (temporary expand).
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Load the pinned preference once on mount.
  useEffect(() => {
    const saved = localStorage.getItem("opsflow_sidebar_pinned");
    if (saved === "true") setPinned(true);
  }, []);

  function togglePinned() {
    const next = !pinned;
    setPinned(next);
    localStorage.setItem("opsflow_sidebar_pinned", String(next));
  }

  // The sidebar is visually expanded if the user pinned it OR is hovering it.
  const expanded = pinned || hovered;

  const navList = (isExpanded: boolean) => (
    <nav className="flex-1 py-4 px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={isExpanded ? undefined : item.label}
            className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-md text-sm relative ${
              isExpanded ? "" : "justify-center"
            } ${active ? "bg-white/5 text-white" : "text-white/60 hover:text-white/90 hover:bg-white/5"}`}
          >
            {active && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold rounded-r" />}
            <span aria-hidden="true" className="text-lg">{item.icon}</span>
            {isExpanded && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top strip with hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-charcoal text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">∞</span>
          <span className="font-serif text-lg">OpsFlow</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-charcoal text-white flex flex-col animate-in">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">∞</span>
                <div>
                  <div className="font-serif text-lg leading-none">OpsFlow</div>
                  <div className="text-xs text-gold mt-1">Management Suite</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
            </div>
            {navList(true)}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar — auto-expand on hover, pin-able */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`hidden md:flex flex-shrink-0 bg-charcoal text-white flex-col transition-all duration-300 ease-in-out relative ${
          expanded ? "w-60 lg:w-64 xl:w-72" : "w-20"
        }`}
      >
        <div className={`p-6 flex items-center gap-2 border-b border-white/10 ${expanded ? "" : "justify-center px-3"}`}>
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm flex-shrink-0">∞</span>
          {expanded && (
            <div>
              <div className="font-serif text-lg text-white leading-none">OpsFlow</div>
              <div className="text-xs text-gold mt-1">Management Suite</div>
            </div>
          )}
        </div>

        {navList(expanded)}

        {/* Pin toggle — only relevant on desktop */}
        <button
          onClick={togglePinned}
          aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          title={pinned ? "Unpin (auto-collapse on hover-out)" : "Pin open"}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-charcoal border border-gold flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition-colors z-10"
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </aside>
    </>
  );
}
