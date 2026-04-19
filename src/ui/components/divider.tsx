/**
 * Horizontal divider line with margin.
 */
export function Divider({ className = "" }: { className?: string }) {
  return <div className={`mx-4 my-6 h-px bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}
