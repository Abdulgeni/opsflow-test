"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "My Leases", href: "/portal", icon: "▣" },
  { label: "Documents", href: "/portal/documents", icon: "▥" },
  { label: "Settings", href: "/portal/settings", icon: "⚙" },
];

// "/portal" is active on the portal home AND on any /portal/leases/[id]
// detail page, but NOT on /portal/documents or /portal/settings.
function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/portal") {
    return pathname === "/portal" || pathname.startsWith("/portal/leases");
  }
  return pathname.startsWith(href);
}

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // "pinned" = user explicitly wants it expanded (persisted, separate from staff).
  // "hovered" = mouse is currently over the sidebar (temporary expand).
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("opsflow_portal_sidebar_pinned");
    if (saved === "true") setPinned(true);
  }, []);

  function togglePinned() {
    const next = !pinned;
    setPinned(next);
    localStorage.setItem("opsflow_portal_sidebar_pinned", String(next));
  }

  function handleSignOut() {
    localStorage.removeItem("opsflow_token");
    localStorage.removeItem("opsflow_user");
    document.cookie = "opsflow_token=; path=/; max-age=0";
    document.cookie = "opsflow_role=; path=/; max-age=0";
    router.push("/sign-in");
  }

  const expanded = pinned || hovered;

  const navList = (isExpanded: boolean) => (
    <nav className="flex-1 py-4 px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href, pathname);
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
            {active && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold rounded-r" />
            )}
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
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">
            ∞
          </span>
          <span className="font-serif text-lg">OpsFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center"
        >
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
                <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">
                  ∞
                </span>
                <div>
                  <div className="font-serif text-lg leading-none">OpsFlow</div>
                  <div className="text-xs text-gold mt-1">Client Portal</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
            </div>
            {navList(true)}
            <div className="px-3 py-4 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
              >
                <span aria-hidden="true" className="text-lg">⏻</span>
                <span>Sign out</span>
              </button>
            </div>
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
        <div
          className={`p-6 flex items-center gap-2 border-b border-white/10 ${
            expanded ? "" : "justify-center px-3"
          }`}
        >
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm flex-shrink-0">
            ∞
          </span>
          {expanded && (
            <div>
              <div className="font-serif text-lg text-white leading-none">OpsFlow</div>
              <div className="text-xs text-gold mt-1">Client Portal</div>
            </div>
          )}
        </div>

        {navList(expanded)}

        {/* Sign out — pinned to the bottom so it's always reachable */}
        <div className={`px-3 pb-4 border-t border-white/10 pt-4 ${expanded ? "" : "px-2"}`}>
          <button
            onClick={handleSignOut}
            title={expanded ? undefined : "Sign out"}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors ${
              expanded ? "" : "justify-center px-2"
            }`}
          >
            <span aria-hidden="true" className="text-lg">⏻</span>
            {expanded && <span>Sign out</span>}
          </button>
        </div>

        {/* Pin toggle — only relevant on desktop */}
        <button
          onClick={togglePinned}
          aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          title={pinned ? "Unpin (auto-collapse on hover-out)" : "Pin open"}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-charcoal border border-gold flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition-colors z-10"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 200ms ease",
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </aside>
    </>
  );
}