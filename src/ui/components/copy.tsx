import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Legacy execCommand copy — works on insecure origins where navigator.clipboard is absent. */
function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Clipboard copy + feedback. `copied` is `true` (or the passed `key`) for
 * `timeout` ms after a copy, so one hook can drive many copy targets.
 *
 * @example
 * const { copied, copy } = useCopy();
 * copy(text);            // copied === true
 * copy(text, "row-3");   // copied === "row-3"  (multiple targets)
 */
export function useCopy(timeout = 2_000) {
  const [copied, setCopied] = useState<string | boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // clear any pending timer on unmount
  useEffect(() => () => { if (timer.current !== undefined) clearTimeout(timer.current); }, []);

  function flagCopied(key?: string) {
    setCopied(key ?? true);
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), timeout);
  }

  function copy(text: string, key?: string) {
    // writeText() rejects asynchronously on insecure origins / denied permission,
    // so only flip to the "copied" state once the write actually succeeds.
    try {
      const p = navigator.clipboard?.writeText(text);
      if (p) p.then(() => flagCopied(key)).catch(() => { /* copy failed — no false success */ });
      else fallbackCopy(text) && flagCopied(key);
    } catch {
      if (fallbackCopy(text)) flagCopied(key);
    }
  }

  return { copied, copy };
}

export interface CopyButtonProps {
  /** Text to copy */
  text: string;
  /** Button label (default: "복사") */
  children?: ReactNode;
  /** Label shown briefly after copying (default: "복사됨!") */
  copiedLabel?: ReactNode;
  /** Accent (any CSS color) for the copied state. Defaults to `var(--kit-accent)`. */
  accent?: string;
  timeout?: number;
  className?: string;
}

/**
 * Button that copies `text` to the clipboard and flips its label to a confirmation.
 *
 * @example
 * <CopyButton text="npm i @m1kapp/kit">설치 명령 복사</CopyButton>
 */
export function CopyButton({
  text,
  children = "복사",
  copiedLabel = "복사됨!",
  accent,
  timeout = 2_000,
  className = "",
}: CopyButtonProps) {
  const { copied, copy } = useCopy(timeout);
  const style: CSSProperties | undefined = copied ? { color: accent ?? "var(--kit-accent)" } : undefined;
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        copied ? "" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      } ${className}`}
      style={style}
    >
      {copied ? copiedLabel : children}
    </button>
  );
}
