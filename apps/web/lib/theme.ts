export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("opsflow_theme") as "light" | "dark") ?? "light";
}

export function setTheme(theme: "light" | "dark") {
  localStorage.setItem("opsflow_theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}