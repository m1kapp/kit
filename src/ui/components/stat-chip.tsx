export interface StatChipProps {
  label: string;
  value: number;
  className?: string;
}

/**
 * Compact stat display chip with label and number.
 */
export function StatChip({ label, value, className = "" }: StatChipProps) {
  return (
    <div className={`flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3 py-3 text-center ${className}`}>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mb-0.5 truncate">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
        {Number.isFinite(value) ? value.toLocaleString() : "–"}
      </p>
    </div>
  );
}
