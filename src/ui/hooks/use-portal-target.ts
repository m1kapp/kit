import { useEffect, useRef, useState } from "react";

/**
 * Finds the nearest portal container by walking up from a hidden anchor span.
 * Searches for `selectors` in order via `.closest()`, falls back to `document.body`.
 *
 * Returns `[anchorRef, target]` — attach `anchorRef` to a hidden `<span>` so
 * the DOM walk has a starting point.
 */
export function usePortalTarget(
  selectors: string | string[] = ".app-shell-root",
): [React.RefObject<HTMLSpanElement | null>, HTMLElement | null] {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const sels = typeof selectors === "string" ? [selectors] : selectors;
    let el: HTMLElement | null = null;
    for (const sel of sels) {
      el = anchorRef.current?.closest<HTMLElement>(sel) ?? null;
      if (el) break;
    }
    el ??= document.querySelector<HTMLElement>(".app-shell-root") ?? document.body;
    setTarget(el);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [anchorRef, target];
}
