"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface Toast { id: string; message: string; tone: "success" | "error"; }
const ToastContext = createContext<{ show: (msg: string, tone?: "success" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: "success" | "error" = "success") => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in px-4 py-3 rounded-lg shadow-card text-sm text-white ${
              t.tone === "success" ? "bg-charcoal" : "bg-status-negative-text"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}