"use client";

import type { ReactNode } from "react";

export interface FabProps {
  onClick: () => void;
  icon: ReactNode;
  /** Accent background color. Default: zinc-900/white (follows dark mode) */
  color?: string;
  className?: string;
}

/**
 * Floating Action Button — positioned absolute bottom-right inside AppShell.
 *
 * @example
 * <AppShellContent>
 *   {content}
 *   <Fab onClick={handleAdd} icon={<PlusIcon />} color="#6366f1" />
 * </AppShellContent>
 */
export function Fab({ onClick, icon, color, className = "" }: FabProps) {
  return (
    <button
      onClick={onClick}
      className={`sticky bottom-6 ml-auto mr-6 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 hover:scale-105 cursor-pointer ${
        color ? "" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
      } ${className}`}
      style={color ? { backgroundColor: color, color: "#fff" } : undefined}
    >
      {icon}
    </button>
  );
}
