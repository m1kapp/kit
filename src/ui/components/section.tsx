import { type ReactNode } from "react";

export interface SectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Padded section wrapper (px-4).
 */
export function Section({ children, className = "" }: SectionProps) {
  return <section className={`px-4 ${className}`}>{children}</section>;
}

export interface SectionHeaderProps {
  children: ReactNode;
}

/**
 * Small uppercase section title.
 */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2 className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mb-3">
      {children}
    </h2>
  );
}
