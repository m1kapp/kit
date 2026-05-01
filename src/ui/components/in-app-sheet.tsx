"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../hooks/use-escape-key";
import { useFocusTrap } from "../hooks/use-focus-trap";
import { usePortalTarget } from "../hooks/use-portal-target";
import { useScrollLock } from "../hooks/use-scroll-lock";

export interface InAppSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** 시트 상단 타이틀 — X 버튼과 나란히 정렬 */
  title?: string;
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
  title,
  fullHeight = false,
  hideClose = false,
  closeLabel = "닫기",
}: InAppSheetProps) {
  const [anchorRef, target] = usePortalTarget();
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  const [visible, setVisible] = useState(false);

  // Swipe state
  const dragState = useRef<{ startY: number; currentY: number; dragging: boolean }>({
    startY: 0,
    currentY: 0,
    dragging: false,
  });
  const [dragOffset, setDragOffset] = useState(0);

  useScrollLock(open, anchorRef);
  useEscapeKey(open, onClose);

  // Mount portal when opening, unmount after close animation
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
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
      {target && visible
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
                className={`relative z-10 w-full rounded-t-2xl bg-white dark:bg-zinc-950 border border-b-0 border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ease-out ${fullHeight ? "h-full flex flex-col" : ""} ${open && dragOffset === 0 ? "translate-y-0" : !open ? "translate-y-full" : ""} ${className}`}
                style={sheetStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 cursor-grab">
                  <div className="w-8 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                </div>
                {/* Header row: title + close */}
                {(title || !hideClose) && (
                  <div className="flex items-center justify-between px-5 pt-1 pb-2">
                    {title ? (
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
                    ) : (
                      <span />
                    )}
                    {!hideClose && (
                      <button
                        onClick={onClose}
                        aria-label={closeLabel}
                        className="flex-shrink-0 p-1.5 -mr-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                {children}
              </div>
            </div>,
            target,
          )
        : null}
    </>
  );
}
