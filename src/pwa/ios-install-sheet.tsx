"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../ui/hooks/use-escape-key";
import { useFocusTrap } from "../ui/hooks/use-focus-trap";
import { useScrollLock } from "../ui/hooks/use-scroll-lock";
import { detectInApp, externalUrl, inAppSteps, isAndroid, IN_APP_NAME } from "./in-app";

interface IOSInstallSheetProps {
  open: boolean;
  onClose(): void;
  appName: string;
  iconSrc?: string;
  /** "in-app": 인스타·카톡 안 브라우저 — 바깥 브라우저로 여는 법을 안내한다 */
  mode?: "safari" | "in-app";
  /** 설치하면 뭐가 좋은지 — 이걸 먼저 보여 줘야 단계를 따라 한다 */
  benefits?: string[];
}

const BENEFITS = ["홈 화면 아이콘으로 바로 열려요", "인터넷이 없어도 열려요 (비행기 모드 · 로밍 끊김)", "주소창 없이 앱처럼 꽉 찬 화면"];

type Step = [string, string, string];
const SAFARI_STEPS: Step[] = [
  ["화면 아래(또는 주소창 옆)의 ", "공유", " 버튼을 누르세요"],
  ["목록을 내려 ", "홈 화면에 추가", "를 누르세요"],
  ["오른쪽 위 ", "추가", "를 누르면 끝!"],
];

/**
 * 홈 화면 추가 안내 시트 — iOS Safari 와 앱 안 브라우저(인스타·카톡 …) 둘 다.
 * 앱 안이면 카카오톡·라인·안드로이드는 [브라우저로 열기] 한 번으로 넘기고, 안 되는 곳(iOS 인스타·스레드)은
 * 그 앱 메뉴 이름 그대로 단계를 보여 주고 링크 복사를 붙인다.
 */
export function IOSInstallSheet({ open, onClose, appName, iconSrc, mode = "safari", benefits = BENEFITS }: IOSInstallSheetProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  useEscapeKey(open, onClose);
  useScrollLock(open);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const ua = navigator.userAgent;
  const android = isAndroid(ua);
  const app = mode === "in-app" ? detectInApp(ua) ?? "other" : null;
  const jump = app ? externalUrl(app, location.href, android) : null;
  const steps = app ? inAppSteps(app, android) : SAFARI_STEPS;
  const icons = app ? [<MoreIcon key="m" />, <SafariIcon key="s" />, <AddHomeIcon key="a" />] : [<ShareIcon key="s" />, <AddHomeIcon key="a" />, <CheckSquareIcon key="c" />];
  const copy = () => navigator.clipboard?.writeText(location.href).then(() => setCopied(true), () => {});
  const strong = "text-zinc-900 dark:text-zinc-100";

  // body 로 띄운다 — 헤더처럼 backdrop-blur 가 걸린 조상 안에서 렌더하면 fixed 가 그 안에 갇혀 시트가 헤더 속에 찌그러진다
  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${appName} 설치하기`}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[430px] max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white dark:bg-zinc-900 shadow-2xl"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <div className="px-5 pb-8 pt-3">
          <div className="flex items-center gap-3 mb-4">
            {iconSrc ? (
              <img src={iconSrc} alt={appName} className="w-12 h-12 rounded-xl shadow" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <DownloadIcon size={22} className="text-zinc-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-zinc-900 dark:text-white text-base">{appName} 앱으로 설치</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {app ? `지금은 ${IN_APP_NAME[app]} 안이라 바로 설치가 안 돼요` : "무료 · 앱스토어 없이 30초면 끝나요"}
              </p>
            </div>
          </div>

          {/* 왜 설치하나 — 이걸 먼저 봐야 단계를 따라 한다 */}
          <ul className="mb-5 space-y-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-4 py-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[13px] text-zinc-700 dark:text-zinc-200">
                <span className="mt-0.5 text-emerald-500"><CheckIcon /></span>{b}
              </li>
            ))}
          </ul>

          {jump && (
            <>
              <a href={jump}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 py-3 text-sm font-semibold text-white dark:text-zinc-900 active:scale-[0.98] transition-transform">
                <SafariIcon /> {app === "kakao" || app === "line" ? "기본 브라우저로 열기" : "Chrome으로 열기"}
              </a>
              <p className="mt-2 mb-4 text-center text-xs text-zinc-400">열린 브라우저에서 설치를 한 번 더 누르면 끝 · 안 열리면 아래대로</p>
            </>
          )}

          <div className="space-y-3">
            {steps.map(([a, b, c], i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-500 dark:text-zinc-400">
                  {icons[i]}
                </div>
                <p className="flex-1 pt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mr-1.5">{i + 1}</span>
                  {a}<strong className={strong}>{b}</strong>{c}
                </p>
              </div>
            ))}
          </div>

          {app && !jump && (
            <button onClick={copy}
              className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 active:scale-[0.98] transition-transform">
              {copied ? "복사됨 · Safari 주소창에 붙여 넣으세요" : "링크 복사해서 Safari로 열기"}
            </button>
          )}

          <button
            onClick={onClose}
            className="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </>
  , document.body);
}

/* ── Icons ── */
export function DownloadIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function AddHomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function SafariIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}
