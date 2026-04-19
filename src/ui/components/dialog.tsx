import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Max width of the panel (default: "max-w-sm") */
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  /** Hide the backdrop click-to-close behaviour */
  persistent?: boolean;
  className?: string;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

/**
 * Modal dialog with:
 * - Portal render (no z-index issues)
 * - Backdrop click to close
 * - Escape key to close
 * - Body scroll lock
 * - Smooth scale + fade animation
 *
 * @example
 * <Dialog open={open} onClose={() => setOpen(false)} title="삭제 확인">
 *   <p className="text-sm text-zinc-500">정말 삭제할까요?</p>
 *   <div className="flex gap-2 mt-4">
 *     <Button onClick={handleDelete}>삭제</Button>
 *     <Button onClick={() => setOpen(false)}>취소</Button>
 *   </div>
 * </Dialog>
 */
export function Dialog({
  open,
  onClose,
  title,
  size = "sm",
  children,
  persistent = false,
  className = "",
}: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Mount → animate in
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open || persistent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, persistent]);

  // Scroll lock
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={persistent ? undefined : onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full ${sizes[size]} bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 transition-all duration-200 ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        } ${className}`}
      >
        {/* Close button */}
        {!persistent && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {title && (
          <h2
            id="dialog-title"
            className="text-lg font-bold text-zinc-900 dark:text-white mb-4 pr-6"
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
}
