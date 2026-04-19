import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useId,
} from "react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

type ToastFn = (message: string, options?: ToastOptions) => void;

/* ─────────────────────────────────────────
   Context
───────────────────────────────────────── */
const ToastContext = createContext<ToastFn | null>(null);

/* ─────────────────────────────────────────
   ToastProvider
───────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback<ToastFn>((message, options) => {
    const id = Math.random().toString(36).slice(2, 9);
    const duration = options?.duration ?? 2500;
    setToasts((prev) => [
      ...prev,
      { id, message, variant: options?.variant ?? "default", duration, action: options?.action },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-24 inset-x-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─────────────────────────────────────────
   ToastBubble
───────────────────────────────────────── */
const variantStyles: Record<ToastVariant, string> = {
  default: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900",
  success: "bg-green-600 text-white",
  error:   "bg-red-600 text-white",
  info:    "bg-blue-600 text-white",
};

function ToastBubble({ item }: { item: ToastItem }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-[390px] px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl transition-all duration-300 ${
        variantStyles[item.variant]
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} ${item.action ? "flex items-center justify-between gap-3" : "text-center"}`}
    >
      <span>{item.message}</span>
      {item.action && (
        <button
          onClick={item.action.onClick}
          className="shrink-0 underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity"
        >
          {item.action.label}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   useToast
───────────────────────────────────────── */
export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
