import { type ReactNode, type CSSProperties } from "react";
import { COMPILED_CSS } from "../_compiled-styles";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
  /** Max width of the shell. Default: 430px */
  maxWidth?: number;
  /** Max height of the shell. Default: 932px (iPhone 15 Pro Max) */
  maxHeight?: number;
  /**
   * Accent color (any CSS color) propagated to kit components as `--kit-accent`.
   * Lets you re-skin the whole shell — Switch, SegmentedControl, ChatBubble,
   * ActionCard, ListRow… — in one place. e.g. accent="#e2603f"
   *
   * When `accent` is a hex color, a contrasting foreground (`--kit-accent-fg`,
   * black/white) is derived automatically so labels on the accent stay legible.
   */
  accent?: string;
  /**
   * Foreground color used *on top of* the accent (`--kit-accent-fg`). Defaults
   * to an auto-derived black/white for hex accents, else white. Set this when
   * `accent` is a non-hex CSS color (named/rgb/hsl) and the default contrasts poorly.
   */
  accentFg?: string;
  style?: CSSProperties;
}

/** Pick black or white for legible text on a hex background (per WCAG relative luminance). */
function contrastFg(accent: string): string | undefined {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(accent.trim());
  if (!m) return undefined; // not a hex color — caller should pass accentFg
  let hex = m[1];
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? "#000000" : "#ffffff";
}

/**
 * Mobile app-like container with rounded corners, shadow, and ring.
 * Centers content and constrains width for a phone-like viewport.
 *
 * `AppShell` fills `h-full` of its parent — it does not size itself. Wrap it
 * in `<Watermark>` (gives `h-dvh` + centering + the `PoweredByKit` credit
 * strip) rather than a hand-rolled height/centering div; without a sized
 * parent the shell just collapses to content height.
 *
 * The shell and the credit strip are centered together as one group — the
 * strip sits directly under the shell and moves with it, it does not pin to
 * the screen's true bottom edge.
 *
 * @example
 * <Watermark color="#e2603f" text="myapp">
 *   <AppShell>
 *     <AppShellHeader>...</AppShellHeader>
 *     <AppShellContent><Section>...</Section></AppShellContent>
 *   </AppShell>
 * </Watermark>
 */
export function AppShell({
  children,
  className = "",
  maxWidth = 430,
  maxHeight = 932,
  accent,
  accentFg,
  style,
}: AppShellProps) {
  const vars: Record<string, string> = {};
  if (accent) {
    vars["--kit-accent"] = accent;
    const fg = accentFg ?? contrastFg(accent);
    if (fg) vars["--kit-accent-fg"] = fg;
  } else if (accentFg) {
    vars["--kit-accent-fg"] = accentFg;
  }
  const accentVar = Object.keys(vars).length ? (vars as CSSProperties) : undefined;
  return (
    <div
      className={`app-shell-root relative w-full h-full flex flex-col bg-white dark:bg-zinc-950 shadow-2xl ring-1 ring-black/10 dark:ring-zinc-700 sm:rounded-2xl overflow-hidden ${className}`}
      style={{ maxWidth, maxHeight, ...accentVar, ...style }}
    >
      {/* React 19 hoists this to <head> and deduplicates by href — eliminates FOUC without manual <KitStyles /> */}
      <style href="m1kapp-kit" precedence="default">{COMPILED_CSS}</style>
      {children}
    </div>
  );
}

export interface AppShellHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * `AppShellHeader`'s rendered height (base 3.5rem/56px + the top safe-area
 * inset on notched devices). Pass this as `<FetchProgress top={APP_SHELL_HEADER_HEIGHT}>`
 * instead of hardcoding `56` so the progress bar still sits flush under the
 * header on a device with a Dynamic Island / notch.
 */
export const APP_SHELL_HEADER_HEIGHT = "calc(3.5rem + env(safe-area-inset-top))";

/**
 * Sticky top header with blur backdrop.
 *
 * On mobile the shell is full-bleed (no `sm:` margin from Watermark), so this
 * is the actual topmost element under the device status bar / Dynamic Island
 * in an installed PWA — `min-height` (not `height`) plus `padding-top` let the
 * safe-area inset grow the header without squeezing its content, the same
 * ownership split PoweredByKit uses for the bottom inset.
 */
export function AppShellHeader({ children, className = "" }: AppShellHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-20 px-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sm:rounded-t-2xl ${className}`}
      style={{ minHeight: APP_SHELL_HEADER_HEIGHT, paddingTop: "env(safe-area-inset-top)" }}
    >
      {children}
    </header>
  );
}

export interface AppShellContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Scrollable main content area. Carries no padding of its own — build
 * children from `<Section>` (px-4) blocks separated by `<Divider spacing="sm" />`,
 * not a hand-rolled `<div className="p-4 flex flex-col gap-4">`.
 */
export function AppShellContent({ children, className = "" }: AppShellContentProps) {
  return (
    <div className="in-app-sheet-content-portal relative flex-1 overflow-hidden">
      <div className={`tab-scroll h-full overflow-y-auto scrollbar-hide ${className}`}>
        {children}
      </div>
    </div>
  );
}
