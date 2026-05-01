import { useEffect, type RefObject } from "react";

/**
 * Locks scroll on the nearest `.tab-scroll` ancestor (or falls back to querySelector)
 * while `active` is true. Restores previous overflow on cleanup.
 */
export function useScrollLock(active: boolean, anchorRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const scrollEl =
      anchorRef?.current?.closest<HTMLElement>(".tab-scroll") ??
      document.querySelector<HTMLElement>(".tab-scroll");
    if (!scrollEl) return;
    const prev = scrollEl.style.overflow;
    const scrollY = scrollEl.scrollTop;
    scrollEl.style.overflow = "hidden";
    return () => {
      scrollEl.style.overflow = prev;
      scrollEl.scrollTop = scrollY;
    };
  }, [active, anchorRef]);
}
