"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../hooks/use-escape-key";
import { useFocusTrap } from "../hooks/use-focus-trap";
import { useScrollLock } from "../hooks/use-scroll-lock";

export interface InAppSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** true면 시트가 AppShell 전체 높이를 채움 */
  fullHeight?: boolean;
  /** 우상단 X 버튼 숨기기. Default: false (보임) */
  hideClose?: boolean;
  /** 닫기 버튼 aria-label. Default: "닫기" */
  closeLabel?: string;
}

const DISMISS_THRESHOLD = 80; // px to swipe before closing

export function InAppSheet({
  open,
  onClose,
  children,
  className = "",
  fullHeight = false,
  hideClose = false,
  closeLabel = "닫기",
}: InAppSheetProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  // Swipe state
  const dragState = useRef<{ startY: number; currentY: number; dragging: boolean }>({
    startY: 0,
    currentY: 0,
    dragging: false,
  });
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    const el =
      anchorRef.current?.closest<HTMLElement>(".app-shell-root") ??
      document.querySelector<HTMLElement>(".app-shell-root");
    setTarget(el ?? document.body);
  }, []);

  useScrollLock(open, anchorRef);
  useEscapeKey(open, onClose);

  // Reset drag offset when closed
  useEffect(() => {
    if (!open) setDragOffset(0);
  }, [open]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragState.current = {
      startY: e.touches[0].clientY,
      currentY: e.touches[0].clientY,
      dragging: true,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragState.current.dragging) return;
    dragState.current.currentY = e.touches[0].clientY;
    const dy = Math.max(0, dragState.current.currentY - dragState.current.startY);
    setDragOffset(dy);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const dy = dragState.current.currentY - dragState.current.startY;
    if (dy > DISMISS_THRESHOLD) {
      onClose();
    }
    setDragOffset(0);
  }, [onClose]);

  const sheetStyle: React.CSSProperties = dragOffset > 0
    ? { transform: `translateY(${dragOffset}px)`, transition: "none" }
    : undefined as unknown as React.CSSProperties;

  const backdropOpacity = dragOffset > 0
    ? Math.max(0, 1 - dragOffset / 300)
    : undefined;

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" className="hidden" />
      {target
        ? createPortal(
            <div
              className={`absolute inset-0 z-50 flex items-end ${open ? "pointer-events-auto" : "pointer-events-none"}`}
            >
              {/* backdrop */}
              <div
                onClick={onClose}
                className={`absolute inset-0 cursor-pointer bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
                style={backdropOpacity !== undefined ? { opacity: backdropOpacity } : undefined}
              />
              {/* sheet */}
              <div
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                className={`relative z-10 w-full transition-transform duration-300 ease-out ${fullHeight ? "h-full" : ""} ${open && dragOffset === 0 ? "translate-y-0" : !open ? "translate-y-full" : ""} ${className}`}
                style={sheetStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Drag handle + close */}
                <div className="relative flex justify-center pt-2 pb-1 cursor-grab">
                  <div className="w-8 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  {!hideClose && (
                    <button
                      onClick={onClose}
                      aria-label={closeLabel}
                      className="absolute top-2 right-3 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                {children}
              </div>
            </div>,
            target,
          )
        : null}
    </>
  );
}
