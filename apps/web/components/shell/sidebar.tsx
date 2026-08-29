"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Properties", href: "/properties", icon: "▤" },
  { label: "Clients", href: "/clients", icon: "◐" },
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

  const navList = (
    <nav className="flex-1 py-4 px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm relative ${
              active ? "bg-white/5 text-white" : "text-white/60 hover:text-white/90 hover:bg-white/5"
            }`}
          >
            {active && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold rounded-r" />}
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top strip with hamburger — visible only below md breakpoint */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-charcoal text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">∞</span>
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
                <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">∞</span>
                <div>
                  <div className="font-serif text-lg leading-none">OpsFlow</div>
                  <div className="text-xs text-gold mt-1">Management Suite</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
            </div>
            {navList}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar — hidden below md breakpoint */}
      <aside className="hidden md:flex w-[280px] flex-shrink-0 bg-charcoal text-white flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-white/10">
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">∞</span>
          <div>
            <div className="font-serif text-lg text-white leading-none">OpsFlow</div>
            <div className="text-xs text-gold mt-1">Management Suite</div>
          </div>
        </div>
        {navList}
      </aside>
    </>
  );
}