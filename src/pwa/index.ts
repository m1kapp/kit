import type { Viewport, MetadataRoute } from "next";

export { usePWAInstall } from "./use-pwa-install";
export type { UsePWAInstallReturn, PWAInstallState } from "./use-pwa-install";

export { PWAInstallButton, IOSInstallSheet } from "./pwa-install-button";

/**
 * Standard mobile viewport config for Next.js.
 * - Disables pinch zoom via maximumScale (Android, older iOS)
 * - Prevents input auto-zoom on iOS via the CSS in @m1kapp/kit (font-size: max(16px, 1em))
 * - touch-action: pan-x pan-y in CSS handles iOS 10+ pinch zoom
 *
 * Usage: export const viewport = mobileViewport;
 */
export const mobileViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * Generates an SVG icon as a data URI — no image files needed.
 *
 * Usage:
 *   svgIcon("m1k", { size: 192, bg: "#0f172a" })
 *   svgIcon("WP", { size: 512, bg: "#18181b", radius: 0.25 })
 */
export function svgIcon(
  text: string,
  options: {
    size?: number;
    bg?: string;
    color?: string;
    /** Corner radius as a fraction of size. Default: 0.25 (25%) */
    radius?: number;
    /** Font size as a fraction of size. Default: 0.375 */
    fontSize?: number;
  } = {}
): string {
  const {
    size = 192,
    bg = "#000000",
    color = "#ffffff",
    radius = 0.25,
    fontSize = 0.375,
  } = options;

  const rx = Math.round(size * radius);
  const fs = Math.round(size * fontSize);
  const encodedBg = bg.replace("#", "%23");
  const encodedColor = color.replace("#", "%23");

  return (
    `data:image/svg+xml,` +
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'>` +
    `<rect width='${size}' height='${size}' rx='${rx}' fill='${encodedBg}'/>` +
    `<text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' ` +
    `font-family='system-ui,sans-serif' font-size='${fs}' font-weight='900' fill='${encodedColor}'>` +
    `${text}` +
    `</text>` +
    `</svg>`
  );
}

/**
 * Generates a Next.js web app manifest (app/manifest.ts).
 * Icons are auto-generated as inline SVGs — no image files needed.
 *
 * Usage:
 *   // app/manifest.ts
 *   import { createManifest } from "@m1kapp/kit";
 *   export default createManifest({
 *     name: "m1k",
 *     shortName: "m1k",
 *     themeColor: "#0f172a",
 *     icon: { text: "m1k" },
 *   });
 */
export function createManifest(options: {
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
}): MetadataRoute.Manifest {
  const {
    name,
    shortName = name,
    description,
    startUrl = "/",
    backgroundColor = "#ffffff",
    themeColor = "#000000",
    icon,
  } = options;

  const icons: MetadataRoute.Manifest["icons"] = icon
    ? [
        {
          src: svgIcon(icon.text, { size: 192, bg: icon.bg ?? themeColor, color: icon.color, radius: icon.radius }),
          sizes: "192x192",
          type: "image/svg+xml",
        },
        {
          src: svgIcon(icon.text, { size: 512, bg: icon.bg ?? themeColor, color: icon.color, radius: icon.radius }),
          sizes: "512x512",
          type: "image/svg+xml",
        },
      ]
    : [];

  return {
    name,
    short_name: shortName,
    ...(description && { description }),
    start_url: startUrl,
    display: "standalone",
    orientation: "portrait",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons,
  };
}
