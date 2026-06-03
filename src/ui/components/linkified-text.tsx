import { type CSSProperties, type ReactNode } from "react";

export interface LinkifiedTextProps {
  children: string;
  /** Link color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  /** Also linkify bare domains with a path, e.g. `meet.google.com/abc`. Default: true */
  linkifyBareDomains?: boolean;
  className?: string;
}

// http(s) URLs, or bare domains that have a path (e.g. meet.google.com/abc-def).
const URL_RE =
  /(https?:\/\/[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s]+)/gi;
const HTTP_ONLY_RE = /(https?:\/\/[^\s]+)/gi;

/**
 * Renders plain text with URLs auto-linked. Preserves newlines
 * (`whitespace-pre-wrap`). Link color follows `--kit-accent` or the `accent` prop.
 *
 * @example
 * <LinkifiedText>회의록: https://docs.google.com/… 그리고 meet.google.com/abc-def</LinkifiedText>
 */
export function LinkifiedText({
  children,
  accent,
  linkifyBareDomains = true,
  className = "",
}: LinkifiedTextProps) {
  const re = linkifyBareDomains ? URL_RE : HTTP_ONLY_RE;
  const linkStyle: CSSProperties = { color: accent ?? "var(--kit-accent)" };

  // split keeps the captured URL tokens at odd indices
  const parts = children.split(re);
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (i % 2 === 0) return part;
    const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2"
        style={linkStyle}
      >
        {part}
      </a>
    );
  });

  return <span className={`whitespace-pre-wrap break-words ${className}`}>{nodes}</span>;
}
