import { useEffect, type RefObject } from "react";

const locks = new WeakMap<HTMLElement, { count: number; overflow: string; scrollTop: number }>();

/**
 * Locks scroll on the nearest `.tab-scroll` ancestor (or falls back to querySelector)
 * while `active` is true. Restores previous overflow on cleanup.
 */
export function useScrollLock(active: boolean, anchorRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const scrollEl =
      anchorRef?.current?.closest<HTMLElement>(".tab-scroll") ??
      anchorRef?.current?.closest(".app-shell-root")?.querySelector<HTMLElement>(".tab-scroll") ??
      document.querySelector<HTMLElement>(".tab-scroll");
    if (!scrollEl) return;
    const lock = locks.get(scrollEl) ?? { count: 0, overflow: scrollEl.style.overflow, scrollTop: scrollEl.scrollTop };
    lock.count++;
    locks.set(scrollEl, lock);
    scrollEl.style.overflow = "hidden";
    return () => {
      if (--lock.count) return;
      scrollEl.style.overflow = lock.overflow;
      scrollEl.scrollTop = lock.scrollTop;
      locks.delete(scrollEl);
    };
  }, [active, anchorRef]);
}
