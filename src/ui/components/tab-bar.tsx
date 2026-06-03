import { type ReactNode } from "react";

export interface TabBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sticky bottom navigation tab bar.
 */
export function TabBar({ children, className = "" }: TabBarProps) {
  return (
    <nav
      className={`sticky bottom-0 z-20 border-t border-zinc-200 dark:border-zinc-800 flex bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-b-2xl ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {children}
    </nav>
  );
}

export interface TabProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  /** Active tab color. Default: current text color */
  activeColor?: string;
}

/**
 * Individual tab button for the TabBar.
 *
 * The active state is conveyed two ways so it works for BOTH `currentColor`
 * SVG icons and full-color emoji icons (emoji ignore `color`): the inactive
 * tab is dimmed (opacity + slight desaturation) with a muted label, while the
 * active tab is full-strength with its label tinted `activeColor`. The icon is
 * wrapped at a consistent size so mixed emoji/SVG icons line up.
 */
export function Tab({ active, onClick, icon, label, activeColor }: TabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-[opacity,filter,color] duration-150 ${
        active ? "opacity-100" : "text-zinc-400 dark:text-zinc-500 opacity-60 [filter:grayscale(0.35)]"
      }`}
      style={active ? { color: activeColor } : undefined}
    >
      <span className="text-[1.35rem] leading-none">{icon}</span>
      <span className="text-[10px] font-medium max-w-full truncate px-1">{label}</span>
    </button>
  );
}
