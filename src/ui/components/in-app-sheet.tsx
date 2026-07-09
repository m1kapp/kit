"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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

// Spring-like easing for buttery smooth feel
const EASE_OPEN = "cubic-bezier(0.32, 0.72, 0, 1)";
const EASE_CLOSE = "cubic-bezier(0.32, 0.72, 0, 1)";
const DURATION_OPEN = 500; // ms — generous for spring feel
const DURATION_CLOSE = 300; // ms — snappy exit

/** 마운트 → 1프레임 뒤 enter 전환, 닫힘 → exit 애니메이션 후 언마운트 */
function useSheetTransition(open: boolean) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  // Mount / unmount lifecycle
  useEffect(() => {
    if (open) {
      // Mount the portal first
      setMounted(true);
    } else {
      // Start exit transition, then unmount after animation
      setEntered(false);
      const timer = setTimeout(() => setMounted(false), DURATION_CLOSE);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Trigger enter transition 1 frame after mount so browser paints initial state
  useEffect(() => {
    if (mounted && open) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEntered(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [mounted, open]);

  return { mounted, entered };
}

/** 아래로 스와이프 → 임계 초과 시 onClose. dragOffset은 시트 translateY */
function useSheetDrag(open: boolean, onClose: () => void) {
  const dragState = useRef<{ startY: number; currentY: number; dragging: boolean }>({
    startY: 0,
    currentY: 0,
    dragging: false,
  });
  const [dragOffset, setDragOffset] = useState(0);

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

  return { dragOffset, onTouchStart, onTouchMove, onTouchEnd };
}

// 인라인 스타일 — 드래그 중엔 transition 끔
function buildSheetStyle(dragOffset: number, entered: boolean): React.CSSProperties {
  if (dragOffset > 0) return { transform: `translateY(${dragOffset}px)`, transition: "none" };
  return {
    transform: entered ? "translateY(0)" : "translateY(100%)",
    transition: `transform ${entered ? DURATION_OPEN : DURATION_CLOSE}ms ${entered ? EASE_OPEN : EASE_CLOSE}`,
  };
}

function buildBackdropStyle(dragOffset: number, entered: boolean): React.CSSProperties {
  if (dragOffset > 0) return { opacity: Math.max(0, 1 - dragOffset / 300), transition: "none" };
  return {
    opacity: entered ? 1 : 0,
    transition: `opacity ${entered ? DURATION_OPEN : DURATION_CLOSE}ms ${entered ? EASE_OPEN : EASE_CLOSE}`,
  };
}

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
  const titleId = useId();

  useScrollLock(open, anchorRef);
  useEscapeKey(open, onClose);

  const { mounted, entered } = useSheetTransition(open);
  const { dragOffset, onTouchStart, onTouchMove, onTouchEnd } = useSheetDrag(open, onClose);

  const sheetStyle = buildSheetStyle(dragOffset, entered);
  const backdropStyle = buildBackdropStyle(dragOffset, entered);

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" className="hidden" />
      {target && mounted
        ? createPortal(
            <div
              className={`absolute inset-0 z-[200] overflow-hidden ${entered ? "pointer-events-auto" : "pointer-events-none"}`}
            >
              {/* backdrop */}
              <div
                onClick={onClose}
                className="absolute inset-0 cursor-pointer bg-black/40"
                style={backdropStyle}
              />
              {/* sheet wrapper — positions sheet at bottom, allows slide from offscreen */}
              <div className="absolute inset-0 flex items-end">
                <div
                  ref={trapRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={title ? titleId : undefined}
                  className={`relative z-10 w-full rounded-t-2xl bg-white dark:bg-zinc-950 border border-b-0 border-zinc-200 dark:border-zinc-800 shadow-2xl will-change-transform ${fullHeight ? "h-full flex flex-col" : ""} ${className}`}
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
                        <p id={titleId} className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
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
                  {fullHeight ? (
                    <div className="flex-1 overflow-y-auto">{children}</div>
                  ) : (
                    children
                  )}
                </div>
              </div>
            </div>,
            target,
          )
        : null}
    </>
  );
}
