import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type PWAInstallState =
  | "android-ready"   // beforeinstallprompt available — can trigger native dialog
  | "ios-safari"      // iOS Safari — must show manual instructions
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

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  // Safari on iOS doesn't have "CriOS" (Chrome) or "FxiOS" (Firefox)
  const isSafariBrowser = isIOS && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  return isSafariBrowser;
}
