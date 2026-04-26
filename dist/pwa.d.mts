import React from 'react';
import { MetadataRoute, Viewport } from 'next';
import * as react_jsx_runtime from 'react/jsx-runtime';

type PWAInstallState = "android-ready" | "ios-safari" | "installed" | "unsupported";
interface UsePWAInstallReturn {
    state: PWAInstallState;
    /** Android only — triggers the native install dialog */
    install(): Promise<void>;
}
declare function usePWAInstall(): UsePWAInstallReturn;

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
declare function PWAInstallButton({ appName, iconSrc, label, installedLabel, className, }: PWAInstallButtonProps): react_jsx_runtime.JSX.Element | null;
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
declare function IOSInstallSheet({ open, onClose, appName, iconSrc }: IOSInstallSheetProps): react_jsx_runtime.JSX.Element | null;

/**
 * Drop into <head> in your root layout to pre-load kit styles and
 * prevent the JS injection from re-running (eliminates FOUC).
 *
 * Usage:
 *   // app/layout.tsx
 *   import { KitStyles } from "@m1kapp/kit/pwa";
 *   <head>
 *     <KitStyles />
 *   </head>
 */
declare function KitStyles(): React.DetailedReactHTMLElement<{
    "data-m1kapp-ui": string;
    dangerouslySetInnerHTML: {
        __html: string;
    };
}, HTMLElement>;

/**
 * Standard mobile viewport config for Next.js.
 * - Disables pinch zoom via maximumScale (Android, older iOS)
 * - Prevents input auto-zoom on iOS via the CSS in @m1kapp/kit (font-size: max(16px, 1em))
 * - touch-action: pan-x pan-y in CSS handles iOS 10+ pinch zoom
 *
 * Usage: export const viewport = mobileViewport;
 */
declare const mobileViewport: Viewport;
/**
 * Generates an SVG icon as a data URI — no image files needed.
 *
 * Usage:
 *   svgIcon("m1k", { size: 192, bg: "#0f172a" })
 *   svgIcon("WP", { size: 512, bg: "#18181b", radius: 0.25 })
 */
declare function svgIcon(text: string, options?: {
    size?: number;
    bg?: string;
    color?: string;
    /** Corner radius as a fraction of size. Default: 0.25 (25%) */
    radius?: number;
    /** Font size as a fraction of size. Default: 0.375 */
    fontSize?: number;
}): string;
/**
 * Generates a Next.js web app manifest function (app/manifest.ts).
 * Icons are auto-generated as inline SVGs — no image files needed.
 *
 * Usage:
 *   // app/manifest.ts
 *   import { createManifest } from "@m1kapp/kit/pwa";
 *   export default createManifest({
 *     name: "m1k",
 *     shortName: "m1k",
 *     themeColor: "#0f172a",
 *     icon: { text: "m1k" },
 *   });
 */
declare function createManifest(options: {
    name: string;
    shortName?: string;
    description?: string;
    startUrl?: string;
    backgroundColor?: string;
    themeColor?: string;
    /** Text-based icon config — generates SVG icons automatically */
    icon?: {
        text: string;
        bg?: string;
        color?: string;
        radius?: number;
    };
}): () => MetadataRoute.Manifest;

export { IOSInstallSheet, KitStyles, PWAInstallButton, type PWAInstallState, type UsePWAInstallReturn, createManifest, mobileViewport, svgIcon, usePWAInstall };
