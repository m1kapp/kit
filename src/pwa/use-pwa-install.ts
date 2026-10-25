"use client";

import { useState, useEffect } from "react";
import { detectInApp, iosCanAddToHome } from "./in-app";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type PWAInstallState =
  | "android-ready"   // beforeinstallprompt available — can trigger native dialog
  | "ios-safari"      // iOS Safari — must show manual instructions
  | "in-app"          // 인스타·스레드·카톡 같은 앱 안 브라우저 — 설치 불가, 바깥 브라우저로 열라고 안내
  | "installed"       // already running in standalone mode
  | "unsupported";    // other browsers (desktop Chrome already installed, Firefox, etc.)

export interface UsePWAInstallReturn {
  state: PWAInstallState;
  /** Android only — triggers the native install dialog */
  install(): Promise<void>;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) { setInstalled(true); return; }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const state: PWAInstallState = (() => {
    if (installed) return "installed";
    if (prompt) return "android-ready";
    if (typeof navigator !== "undefined" && detectInApp(navigator.userAgent)) return "in-app";
    if (isIOSSafari()) return "ios-safari";
    return "unsupported";
  })();

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return { state, install };
}

// 앱 안 브라우저(in-app.ts)는 iOS 에서 Safari 처럼 보인다(UA 에 CriOS 가 없다) — 먼저 걸러야 "Safari 공유 버튼" 안내가 안 나간다
function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports a desktop Macintosh UA — the touch-points check is the
  // standard way to tell it apart from an actual Mac (which reports 0).
  const isIPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || isIPadOS;
  // 사파리만 고르면 크롬 사용자에게 버튼이 사라진다 — 16.4+ 는 다른 브라우저도 된다(in-app.ts)
  return isIOS && iosCanAddToHome(ua);
}
