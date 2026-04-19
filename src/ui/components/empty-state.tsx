import { type ReactNode } from "react";

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

/**
 * Empty state placeholder with icon and message.
 */
export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      {icon || (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-200 dark:text-zinc-700">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15h8" />
          <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
        </svg>
      )}
      <p className="text-sm text-zinc-400 dark:text-zinc-500">{message}</p>
    </div>
  );
}
