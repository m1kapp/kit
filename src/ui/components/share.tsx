"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { InAppSheet } from "./in-app-sheet";
import { usePWAInstall } from "../../pwa/use-pwa-install";
import { IOSInstallSheet } from "../../pwa/ios-install-sheet";

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
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => () => clearTimeout(timerRef.current), []);

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
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
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
  /**
   * 설치할 수 있는 기기면 누를 때 "링크 보내기 · 홈 화면에 추가" 시트를 띄운다.
   * 이미 설치했거나 지원 안 하는 브라우저면 지금처럼 바로 공유. AppShell 안에서 쓴다(시트가 거기 뜬다).
   */
  install?: boolean | { appName?: string; iconSrc?: string };
}

export function ShareButton({
  url,
  title,
  text,
  label = "공유",
  copiedLabel = "링크 복사됨",
  className = "",
  install,
}: ShareButtonProps) {
  const { share, copied } = useShare({ url, title, text });
  const { state, install: promptInstall } = usePWAInstall();
  const [picking, setPicking] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  const canInstall = !!install && (state === "android-ready" || state === "ios-safari");
  const meta = typeof install === "object" ? install : {};

  const addToHome = () => {
    setPicking(false);
    if (state === "android-ready") promptInstall();
    else setIosGuide(true);
  };

  return (
    <>
    <button
      onClick={() => (canInstall ? setPicking(true) : share())}
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
    {canInstall && (
      <>
        <InAppSheet open={picking} onClose={() => setPicking(false)} title={label}>
          <div className="px-5 pb-5 space-y-2">
            <SheetChoice icon={<ShareIcon />} title="링크 보내기" sub="친구에게 이 페이지 주소를 보내요"
              onClick={() => { setPicking(false); share(); }} />
            <SheetChoice icon={<HomeIcon />} title="홈 화면에 추가" sub="앱처럼 바로 열려요 · 인터넷이 없어도 열려요" onClick={addToHome} />
          </div>
        </InAppSheet>
        {state === "ios-safari" && (
          <IOSInstallSheet open={iosGuide} onClose={() => setIosGuide(false)} appName={meta.appName ?? title ?? "앱"} iconSrc={meta.iconSrc} />
        )}
      </>
    )}
    </>
  );
}

function SheetChoice({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-left active:scale-[0.98] transition-transform">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">{sub}</span>
      </span>
    </button>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <polyline points="9 11 12 14 15 11" />
    </svg>
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
