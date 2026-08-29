"use client";
import { useEffect } from "react";
import { getTheme } from "@/lib/theme";

export function ThemeInit() {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", getTheme() === "dark");
  }, []);
  return null;
}