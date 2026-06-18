"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

type ToastType = "error" | "success" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-[320px] flex-col gap-2">
          {toasts.map((t) => (
            <ToastBanner key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastBanner({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const borderMap: Record<ToastType, string> = {
    error: "border-l-[#C0392B]",
    success: "border-l-[#27AE60]",
    info: "border-l-[#6B6560]",
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-[#E0DBD0] border-l-4 bg-white px-4 py-3 text-sm font-medium text-[#1A1814] shadow-md animate-in fade-in slide-in-from-right-4 duration-200 ${borderMap[item.type]}`}>
      <span className="flex-1">{item.message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="mt-px shrink-0 text-[#6B6560] opacity-70 transition-opacity hover:opacity-100">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
