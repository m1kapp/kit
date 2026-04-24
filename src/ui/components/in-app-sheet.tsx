"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface InAppSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** true면 시트가 AppShell 전체 높이를 채움 */
  fullHeight?: boolean;
}

const DISMISS_THRESHOLD = 80; // px to swipe before closing

export function InAppSheet({
  open,
  onClose,
  children,
  className = "",
  fullHeight = false,
}: InAppSheetProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  // Lock background scroll when sheet is open
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
                ref={sheetRef}
                className={`relative z-10 w-full transition-transform duration-300 ease-out ${fullHeight ? "h-full" : ""} ${open && dragOffset === 0 ? "translate-y-0" : !open ? "translate-y-full" : ""} ${className}`}
                style={sheetStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-2 pb-1 cursor-grab">
                  <div className="w-8 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
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
