"use client";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    localStorage.removeItem("opsflow_token");
    localStorage.removeItem("opsflow_user");
    document.cookie = "opsflow_token=; path=/; max-age=0";
    document.cookie = "opsflow_role=; path=/; max-age=0";
    window.location.href = "/sign-in";
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-charcoal text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-charcoal border border-gold flex items-center justify-center text-gold text-sm">
            ∞
          </span>
          <div>
            <div className="font-serif text-lg leading-none">OpsFlow</div>
            <div className="text-xs text-gold mt-1">Client Portal</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}