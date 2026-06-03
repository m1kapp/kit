import { type CSSProperties, type ReactNode } from "react";
import { useCopy } from "./copy";

export interface CodeBlockProps {
  code: string;
  /** Small uppercase label above the code (e.g. "bash", "install") */
  label?: ReactNode;
  /** Hint shown on the right while idle (default: "탭하여 복사") */
  copyHint?: ReactNode;
  /** Confirmation shown after copying (default: "복사됨!") */
  copiedLabel?: ReactNode;
  /** Accent (any CSS color) for the copied state. Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

/**
 * Tap-to-copy code block with a label and copy feedback.
 *
 * @example
 * <CodeBlock label="install" code="npm i @m1kapp/kit" />
 */
export function CodeBlock({
  code,
  label,
  copyHint = "탭하여 복사",
  copiedLabel = "복사됨!",
  accent,
  className = "",
}: CodeBlockProps) {
  const { copied, copy } = useCopy();
  const hintStyle: CSSProperties = { color: accent ?? "var(--kit-accent)" };

  return (
    <div
      onClick={() => copy(code)}
      className={`cursor-pointer rounded-lg bg-zinc-50 px-3 py-3 transition-colors hover:bg-zinc-100 active:scale-[0.99] dark:bg-zinc-900 dark:hover:bg-zinc-800 ${className}`}
    >
      <div className="mb-1 flex items-center justify-between">
        {label != null ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>
        ) : (
          <span />
        )}
        <span className="text-[10px] font-medium" style={hintStyle}>
          {copied ? copiedLabel : copyHint}
        </span>
      </div>
      <code className="block break-all font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{code}</code>
    </div>
  );
}
