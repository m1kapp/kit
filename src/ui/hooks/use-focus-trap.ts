import { useEffect, useLayoutEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside a container while active.
 * Tab / Shift+Tab cycle through focusable elements without escaping.
 *
 * @param active — whether the trap is currently engaged
 * @returns ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Capture before a stacked sheet makes the previous sheet inert and the browser blurs it.
  useLayoutEffect(() => {
    if (active) previousFocus.current = document.activeElement as HTMLElement;
  }, [active]);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Move focus into the container
    const container = containerRef.current;
    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    if (!container.closest("[inert]")) (first ?? container).focus({ preventScroll: true });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || container.closest("[inert]")) return;

      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    function handleFocusIn(event: FocusEvent) {
      if (container.closest("[inert]") || container.contains(event.target as Node)) return;
      const dialog = (event.target as HTMLElement).closest?.('[role="dialog"][aria-modal="true"]');
      if (dialog && dialog !== container.closest('[role="dialog"]')) return;
      (container.querySelector<HTMLElement>(FOCUSABLE) ?? container).focus({ preventScroll: true });
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      // Restore focus when trap is deactivated (only if element is still in DOM)
      const previous = previousFocus.current;
      // The lower sheet removes inert in its next commit before it can receive focus again.
      requestAnimationFrame(() => {
        if (previous?.isConnected && !previous.closest("[inert]")) previous.focus({ preventScroll: true });
      });
    };
  }, [active]);

  return containerRef;
}
