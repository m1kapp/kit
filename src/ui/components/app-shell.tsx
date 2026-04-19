import { type ReactNode, type CSSProperties } from "react";
import { COMPILED_CSS } from "../_compiled-styles";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
  /** Max width of the shell. Default: 430px */
  maxWidth?: number;
  /** Max height of the shell. Default: 932px (iPhone 15 Pro Max) */
  maxHeight?: number;
  style?: CSSProperties;
}

/**
 * Mobile app-like container with rounded corners, shadow, and ring.
 * Centers content and constrains width for a phone-like viewport.
 */
export function AppShell({
  children,
  className = "",
  maxWidth = 430,
  maxHeight = 932,
  style,
}: AppShellProps) {
  return (
    <div
      className={`w-full h-full flex flex-col bg-white dark:bg-zinc-950 shadow-2xl ring-1 ring-black/10 dark:ring-zinc-700 sm:rounded-2xl overflow-hidden ${className}`}
      style={{ maxWidth, maxHeight, ...style }}
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
 * Sticky top header with blur backdrop.
 */
export function AppShellHeader({ children, className = "" }: AppShellHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-20 h-14 px-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sm:rounded-t-2xl ${className}`}
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
 * Scrollable main content area.
 */
export function AppShellContent({ children, className = "" }: AppShellContentProps) {
  return (
    <div className={`flex-1 overflow-y-auto scrollbar-hide ${className}`}>
      {children}
    </div>
  );
}
