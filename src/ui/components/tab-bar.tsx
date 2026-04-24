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
 */
export function Tab({ active, onClick, icon, label, activeColor }: TabProps) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
        !active ? "text-zinc-300 dark:text-zinc-600" : ""
      }`}
      style={active ? { color: activeColor } : undefined}
    >
      {icon}
      <span className="text-[10px] font-medium max-w-full truncate px-1">{label}</span>
    </button>
  );
}
