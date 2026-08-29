export function trackRecentView(label: string, href: string) {
  if (typeof window === "undefined") return;
  const existing = JSON.parse(localStorage.getItem("opsflow_recent") ?? "[]") as { label: string; href: string }[];
  const filtered = existing.filter((r) => r.href !== href);
  const updated = [{ label, href }, ...filtered].slice(0, 5);
  localStorage.setItem("opsflow_recent", JSON.stringify(updated));
}

export function getRecentViews(): { label: string; href: string }[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("opsflow_recent") ?? "[]");
}