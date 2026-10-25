"use client";

import { useState } from "react";
import { useEscapeKey } from "../ui/hooks/use-escape-key";
import { useFocusTrap } from "../ui/hooks/use-focus-trap";
import { useScrollLock } from "../ui/hooks/use-scroll-lock";
import { usePWAInstall } from "./use-pwa-install";
import { IOSInstallSheet, DownloadIcon, ChevronIcon, CheckIcon } from "./ios-install-sheet";
export { IOSInstallSheet } from "./ios-install-sheet";

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
  /** "chip": 헤더용 — ShareButton 과 같은 연회색 알약. 기본 "solid"(검은 버튼) */
  variant?: "solid" | "chip";
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
  variant = "solid",
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
    else setSheetOpen(true); // ios-safari · in-app 은 안내 시트
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={variant === "chip"
          ? `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all ${className ?? ""}`
          : `flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold transition-all active:scale-95 ${className ?? ""}`}
      >
        <DownloadIcon size={variant === "chip" ? 14 : undefined} />
        <span>{label}</span>
        {variant === "solid" && state !== "android-ready" && <ChevronIcon />}
      </button>

      {state !== "android-ready" && (
        <IOSInstallSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          appName={appName}
          iconSrc={iconSrc}
          mode={state === "in-app" ? "in-app" : "safari"}
        />
      )}
    </>
  );
}

/* ── iOS install guide sheet ── */
