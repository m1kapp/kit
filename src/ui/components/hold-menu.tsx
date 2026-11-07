"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../hooks/use-escape-key";

export interface HoldMenuItem {
  label: string;
  onSelect: () => void;
  /** Red, for 삭제 and the like. */
  danger?: boolean;
  disabled?: boolean;
}

export interface HoldMenuProps {
  /** What the row is, for screen readers: the menu and its ··· button are named after it. */
  label: string;
  items: HoldMenuItem[];
  children: ReactNode;
  className?: string;
  /** How long a finger holds before the menu opens (ms). Default 450 */
  delay?: number;
  /** Where the hover ··· sits in the row. Default: right edge, centered — move it off a button already there. */
  moreClassName?: string;
}

const ITEM = 48,
  PAD = 8,
  GAP = 8;

/** Where the menu goes: under the row, or above it when it would run past the screen's bottom. */
export function holdMenuPlacement(row: { top: number; bottom: number }, viewport: number, items: number) {
  const height = items * ITEM + PAD;
  return row.bottom + GAP + height <= viewport - 16
    ? { top: row.bottom + GAP }
    : { top: Math.max(16, row.top - GAP - height) };
}

/**
 * A row with a menu, as Instagram's comments: held down on a phone (long press), right-clicked or opened from the
 * ··· that shows on hover with a mouse, or reached by keyboard (the ··· is a button; the menu key works too).
 * The row lifts over a dimmed screen with the menu under it; a press outside or Esc closes.
 *
 * @example
 * <HoldMenu label="민호님의 댓글" items={[{ label: "답글 달기", onSelect: reply }, { label: "삭제", danger: true, onSelect: remove }]}>
 *   <Comment … />
 * </HoldMenu>
 */
export function HoldMenu({
  label,
  items,
  children,
  className = "",
  delay = 450,
  moreClassName = "right-0 top-1/2 -translate-y-1/2",
}: HoldMenuProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const row = useRef<HTMLDivElement>(null),
    more = useRef<HTMLButtonElement>(null),
    menu = useRef<HTMLDivElement>(null),
    press = useRef<{ timer: number; x: number; y: number } | null>(null);

  const letGo = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };
  const open = () => {
    letGo();
    if (row.current) setRect(row.current.getBoundingClientRect());
  };
  const close = useCallback(() => setRect(null), []);
  useEscapeKey(rect !== null, close);
  useEffect(() => letGo, []);
  // The keyboard lands on the first item; closing hands focus back to the ··· (when it had it).
  useEffect(() => {
    if (!rect) return;
    const back = document.activeElement as HTMLElement | null;
    menu.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
    return () => {
      if (back === more.current) back?.focus({ preventScroll: true });
    };
  }, [rect]);

  const place = rect && holdMenuPlacement(rect, window.innerHeight, items.length);
  const left = rect ? Math.min(Math.max(16, rect.left + 16), window.innerWidth - 240) : 0;

  return (
    <>
      <div
        ref={row}
        className={`group relative select-none [-webkit-touch-callout:none] ${className}`}
        onContextMenu={(event) => {
          event.preventDefault();
          open();
        }}
        onPointerDown={(event) => {
          // A mouse has the right click and the ···; buttons in the row keep their own press.
          if (event.pointerType === "mouse" || (event.target as HTMLElement).closest("button,a,input,textarea")) return;
          letGo();
          press.current = {
            x: event.clientX,
            y: event.clientY,
            timer: window.setTimeout(() => {
              navigator.vibrate?.(10);
              open();
            }, delay),
          };
        }}
        onPointerMove={(event) => {
          if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 8) letGo();
        }}
        onPointerUp={letGo}
        onPointerCancel={letGo}
      >
        {children}
        <button
          ref={more}
          type="button"
          aria-label={`${label} 메뉴`}
          aria-haspopup="menu"
          aria-expanded={!!rect}
          onClick={open}
          className={`absolute ${moreClassName} grid size-8 place-items-center rounded-full bg-white/90 text-zinc-500 opacity-0 transition-opacity hover:text-zinc-900 focus-visible:opacity-100 group-hover:opacity-100 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-zinc-100 pointer-coarse:hidden`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
      </div>

      {rect &&
        place &&
        createPortal(
          // Closes on the next press, not on click: the finger lifting off a long press must not close it. A modal
          // dialog of its own, so an InAppSheet under it lets focus in and leaves Esc to it.
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="fixed inset-0 z-[9998] bg-black/25"
            onPointerDown={close}
            onContextMenu={(event) => event.preventDefault()}
          >
            {/* The row, lifted over the dim (a copy: the real one stays put under it). */}
            <div
              aria-hidden="true"
              className={`pointer-events-none fixed overflow-hidden rounded-xl bg-white dark:bg-zinc-900 ${className}`}
              style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            >
              {children}
            </div>
            <div
              ref={menu}
              role="menu"
              aria-label={label}
              onPointerDown={(event) => event.stopPropagation()}
              className="fixed w-56 overflow-hidden rounded-2xl bg-white py-1 shadow-[0_8px_30px_#0003] dark:bg-zinc-800"
              style={{ top: place.top, left }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                  className={`block h-12 w-full px-5 text-left text-[15px] outline-none hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-700 dark:focus-visible:bg-zinc-700 ${item.danger ? "text-[#ed4956]" : "text-zinc-900 dark:text-zinc-100"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
