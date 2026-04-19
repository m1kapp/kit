import React, { useCallback, useState } from "react";

/* ─────────────────────────────────────────
   useShare
───────────────────────────────────────── */
export interface UseShareOptions {
  url?: string;
  title?: string;
  text?: string;
}

export interface UseShareReturn {
  share: (options?: UseShareOptions) => Promise<void>;
  copied: boolean;
  canNativeShare: boolean;
}

export function useShare(defaults?: UseShareOptions): UseShareReturn {
  const [copied, setCopied] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = useCallback(
    async (options?: UseShareOptions) => {
      const merged = { ...defaults, ...options };
      const url = merged.url ?? (typeof window !== "undefined" ? window.location.href : "");

      if (canNativeShare) {
        try {
          await navigator.share({ title: merged.title, text: merged.text, url });
          return;
        } catch (e) {
          if ((e as DOMException).name === "AbortError") return;
          // fall through to clipboard
        }
      }

      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canNativeShare]
  );

  return { share, copied, canNativeShare };
}

/* ─────────────────────────────────────────
   ShareButton
───────────────────────────────────────── */
export interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function ShareButton({
  url,
  title,
  text,
  label = "공유",
  copiedLabel = "링크 복사됨",
  className = "",
}: ShareButtonProps) {
  const { share, copied } = useShare({ url, title, text });

  return (
    <button
      onClick={() => share()}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all ${className}`}
    >
      {copied ? (
        <>
          <CheckIcon />
          {copiedLabel}
        </>
      ) : (
        <>
          <ShareIcon />
          {label}
        </>
      )}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
