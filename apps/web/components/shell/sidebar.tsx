"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="w-sidebar flex-shrink-0 bg-charcoal text-white flex flex-col">
      <div className="p-6 flex items-center gap-2 border-b border-white/10">
        <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">
          ∞
        </span>
        <div>
          <div className="font-serif text-lg text-white leading-none">OpsFlow</div>
          <div className="font-sans text-xs text-gold mt-1">Management Suite</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm relative ${
                active
                  ? "bg-white/5 text-white"
                  : "text-white/60 hover:text-white/90 hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold rounded-r" />
              )}
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}