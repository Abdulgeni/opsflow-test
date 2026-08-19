export function TopBar() {
  return (
    <header className="h-16 border-b border-surface-container-highest bg-white flex items-center justify-end gap-4 px-8 flex-shrink-0">
      <button
        aria-label="Help"
        className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        ?
      </button>
      <button
        aria-label="Notifications"
        className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        🔔
      </button>
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm text-on-surface">
          U
        </span>
        <span className="font-sans text-sm text-on-surface">Profile</span>
      </div>
    </header>
  );
}