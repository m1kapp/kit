import { type CSSProperties, type ReactNode } from "react";

export interface BarListItem {
  label: ReactNode;
  value: number;
  /** Optional link — the label becomes an anchor */
  href?: string;
}

export interface BarListProps {
  items: BarListItem[];
  /** Bar fill color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  /** Format the trailing value (default: localized number) */
  formatValue?: (value: number) => ReactNode;
  /** Bars are sized relative to this. Default: sum of values. Pass the max for "share of peak". */
  total?: number;
  className?: string;
}

/**
 * Horizontal bar list for ranked breakdowns (top pages, referrers, tags…).
 * Each row is a labeled bar whose width is proportional to its value.
 *
 * @example
 * <BarList items={[{ label: "/", value: 120 }, { label: "/about", value: 64, href: "/about" }]} />
 */
export function BarList({ items, accent, formatValue, total, className = "" }: BarListProps) {
  const accentColor = accent ?? "var(--kit-accent)";
  const denom = total ?? items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, i) => {
        const pct = denom > 0 ? (item.value / denom) * 100 : 0;
        const fillStyle: CSSProperties = { width: `${pct}%`, backgroundColor: accentColor, opacity: 0.15 };
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <div className="absolute inset-y-0 left-0 rounded-lg" style={fillStyle} />
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block truncate px-3 text-sm leading-7 text-zinc-800 underline decoration-zinc-300 hover:decoration-current dark:text-zinc-200 dark:decoration-zinc-600"
                >
                  {item.label}
                </a>
              ) : (
                <span className="relative block truncate px-3 text-sm leading-7 text-zinc-800 dark:text-zinc-200">
                  {item.label}
                </span>
              )}
            </div>
            <span className="w-10 text-right text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
