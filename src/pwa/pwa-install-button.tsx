"use client";

import { useState } from "react";
import { usePWAInstall } from "./use-pwa-install";

interface PWAInstallButtonProps {
  /** App name shown in iOS guide sheet */
  appName?: string;
  /** App icon src shown in iOS guide (optional) */
  iconSrc?: string;
  /** Label for the install button. Default: "앱으로 설치" */
  label?: string;
  /** Label shown when already installed. Default: undefined — button hidden */
  installedLabel?: string;
  className?: string;
}

/**
 * PWA install button that handles both Android and iOS.
 *
 * - Android (Chrome): triggers the native install dialog
 * - iOS (Safari): opens a step-by-step "Add to Home Screen" guide sheet
 * - Already installed: hidden by default (show with installedLabel)
 * - Unsupported: hidden
 *
 * Usage:
 *   <PWAInstallButton appName="My App" iconSrc="/icon.png" />
 */
export function PWAInstallButton({
  appName = "앱",
  iconSrc,
  label = "앱으로 설치",
  installedLabel,
  className,
}: PWAInstallButtonProps) {
  const { state, install } = usePWAInstall();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (state === "installed") {
    if (!installedLabel) return null;
    return (
      <div className={`flex items-center gap-2 text-sm text-zinc-400 ${className ?? ""}`}>
        <CheckIcon />
        <span>{installedLabel}</span>
      </div>
    );
  }

  if (state === "unsupported") return null;

  function handleClick() {
    if (state === "android-ready") install();
    else if (state === "ios-safari") setSheetOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold transition-all active:scale-95 ${className ?? ""}`}
      >
        <DownloadIcon />
        <span>{label}</span>
        {state === "ios-safari" && <ChevronIcon />}
      </button>

      {state === "ios-safari" && (
        <IOSInstallSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          appName={appName}
          iconSrc={iconSrc}
        />
      )}
    </>
  );
}

/* ── iOS install guide sheet ── */

interface IOSInstallSheetProps {
  open: boolean;
  onClose(): void;
  appName: string;
  iconSrc?: string;
}

/**
 * Bottom-sheet guide for iOS "Add to Home Screen".
 * Can also be used standalone if you need custom trigger UI.
 */
export function IOSInstallSheet({ open, onClose, appName, iconSrc }: IOSInstallSheetProps) {
  if (!open) return null;

  const steps = [
    {
      icon: <ShareIcon />,
      text: (
        <>
          하단 툴바의 <strong className="text-zinc-900 dark:text-zinc-100">공유</strong> 버튼을 탭하세요
        </>
      ),
    },
    {
      icon: <AddHomeIcon />,
      text: (
        <>
          스크롤해서{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">홈 화면에 추가</strong>를 탭하세요
        </>
      ),
    },
    {
      icon: <CheckSquareIcon />,
      text: (
        <>
          우측 상단 <strong className="text-zinc-900 dark:text-zinc-100">추가</strong>를 탭하면 완료!
        </>
      ),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[430px] rounded-t-2xl bg-white dark:bg-zinc-900 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <div className="px-5 pb-8 pt-3">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            {iconSrc ? (
              <img src={iconSrc} alt={appName} className="w-12 h-12 rounded-xl shadow" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <DownloadIcon size={22} className="text-zinc-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-zinc-900 dark:text-white text-base">{appName} 설치하기</p>
              <p className="text-xs text-zinc-400 mt-0.5">홈 화면에 추가하면 앱처럼 사용할 수 있어요</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-500 dark:text-zinc-400">
                  {step.icon}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mr-1.5 flex-shrink-0">{i + 1}</span>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Safari indicator */}
          <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <SafariIcon />
            <p className="text-xs text-zinc-400">Safari 브라우저에서만 홈 화면 추가가 가능해요</p>
          </div>

          <button
            onClick={onClose}
            className="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Icons ── */
function DownloadIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
      <polyline points="9 18 15 12 9 6" />
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
