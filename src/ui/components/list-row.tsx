import { type CSSProperties, type ReactNode } from "react";

export interface ListRowProps {
  /** Left color bar + active highlight tint. Defaults to `var(--kit-accent)`. */
  accent?: string;
  /** Leading column, e.g. a time like "14:00" */
  lead?: ReactNode;
  /** Secondary leading line under `lead`, e.g. an end time */
  leadSub?: ReactNode;
  title: ReactNode;
  /** Secondary line under the title */
  sub?: ReactNode;
  /** Trailing content, e.g. "● 지금" or a count badge */
  trailing?: ReactNode;
  /** Highlight as the current/active row */
  active?: boolean;
  /**
   * Scale the row height in units (1 = base height, clamped 46–130px). Useful
   * for any timeline where rows have different magnitudes.
   * For a schedule, pass `durationMinutes / 30`.
   */
  heightScale?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * Timeline / list row: left color bar, a leading column (time), a title with an
 * optional subtitle, and trailing content. Height can scale via `heightScale` —
 * handy for schedules, to-dos, Gantt-style timelines, and time blocks.
 *
 * @example
 * <ListRow accent="#7fc06a" lead="14:00" title="회의" sub="👥 김상훈" heightScale={2} onClick={open} />
 * <ListRow lead="09:00" title="스탠드업" trailing="● 지금" active />
 */
export function ListRow({
  accent,
  lead,
  leadSub,
  title,
  sub,
  trailing,
  active = false,
  heightScale,
  onClick,
  className = "",
}: ListRowProps) {
  const accentColor = accent ?? "var(--kit-accent)";

  let minHeight: number | undefined;
  if (heightScale != null) {
    const units = Math.max(1, Math.round(heightScale));
    minHeight = Math.max(46, Math.min(130, 46 + (units - 1) * 13));
  }

  const style: CSSProperties = { minHeight };
  if (active) {
    style.borderColor = accentColor;
    style.backgroundColor = `color-mix(in srgb, ${accentColor} 10%, transparent)`;
  }

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-stretch gap-2.5 overflow-hidden rounded-xl border text-left ${
        active
          ? ""
          : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40"
      } ${onClick ? "cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70" : ""} ${className}`}
      style={style}
    >
      <span className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />
      {(lead != null || leadSub != null) && (
        <div className="flex min-w-11 flex-col justify-between py-2.5">
          <span className="text-[13.5px] font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
            {lead}
          </span>
          {leadSub != null && (
            <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{leadSub}</span>
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center py-2.5 pr-3">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14.5px] font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
          {trailing != null && (
            <span className="shrink-0 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">{trailing}</span>
          )}
        </div>
        {sub != null && (
          <div className="mt-0.5 truncate text-[11.5px] text-zinc-400 dark:text-zinc-500">{sub}</div>
        )}
      </div>
    </Tag>
  );
}
