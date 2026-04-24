import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../hooks/use-focus-trap";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Max width of the panel (default: "max-w-sm") */
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  /** Hide the backdrop click-to-close behaviour */
  persistent?: boolean;
  /** Close button aria-label. Default: "닫기" */
  closeLabel?: string;
  className?: string;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Dialog({
  open,
  onClose,
  title,
  size = "sm",
  children,
  persistent = false,
  closeLabel = "닫기",
  className = "",
}: DialogProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(visible);

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

  // Find AppShell portal target
  useEffect(() => {
    const el =
      anchorRef.current?.closest<HTMLElement>(".app-shell-root") ??
      document.querySelector<HTMLElement>(".app-shell-root");
    setTarget(el ?? document.body);
  }, []);

  // Escape key
  useEffect(() => {
    if (!open || persistent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, persistent]);

  // Scroll lock (tab-scroll 내부만)
  useEffect(() => {
    if (!open) return;
    const scrollEl =
      anchorRef.current?.closest<HTMLElement>(".tab-scroll") ??
      document.querySelector<HTMLElement>(".tab-scroll");
    if (!scrollEl) return;
    const prev = scrollEl.style.overflow;
    scrollEl.style.overflow = "hidden";
    return () => { scrollEl.style.overflow = prev; };
  }, [open]);

  if (!mounted || typeof document === "undefined" || !target) return (
    <span ref={anchorRef} aria-hidden="true" className="hidden" />
  );

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" className="hidden" />
      {createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className="absolute inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={persistent ? undefined : onClose}
          />

          {/* Panel */}
          <div
            ref={trapRef}
            className={`relative w-full ${sizes[size]} bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 transition-all duration-200 ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95"
            } ${className}`}
          >
            {!persistent && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label={closeLabel}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {title && (
              <h2
                id={titleId}
                className="text-lg font-bold text-zinc-900 dark:text-white mb-4 pr-6"
              >
                {title}
              </h2>
            )}

            {children}
          </div>
        </div>,
        target,
      )}
    </>
  );
}
