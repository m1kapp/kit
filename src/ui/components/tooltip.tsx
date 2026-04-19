import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  /** Placement relative to the trigger. Default: "top" */
  placement?: "top" | "bottom";
}

/**
 * Simple tooltip that appears above (or below) the trigger on hover/focus.
 * Renders via portal so it's never clipped by overflow-hidden containers.
 *
 * @example
 * <Tooltip label="복사하기">
 *   <button>복사</button>
 * </Tooltip>
 */
export function Tooltip({ label, children, placement = "top" }: TooltipProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const show = (e: React.MouseEvent | React.FocusEvent) => {
    setRect((e.currentTarget as HTMLElement).getBoundingClientRect());
  };
  const hide = () => setRect(null);

  const top = rect
    ? placement === "top"
      ? rect.top + window.scrollY - 36
      : rect.bottom + window.scrollY + 8
    : 0;
  const left = rect ? rect.left + window.scrollX + rect.width / 2 : 0;

  return (
    <>
      <span
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>

      {rect &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{ top, left, transform: "translateX(-50%)" }}
          >
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-100">
              {label}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
