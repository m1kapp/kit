import { type CSSProperties, type ReactNode } from "react";
import { CheckIcon, ChevronRightIcon } from "./_icons";

export interface CollapsibleProps {
  title: ReactNode;
  /** Subtitle shown only while collapsed */
  subtitle?: ReactNode;
  /** Small badge text shown only while collapsed */
  badge?: ReactNode;
  /** Leading marker — a step number, letter, or icon */
  leading?: ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Show the leading marker as completed (accent + check) */
  completed?: boolean;
  /** Small "선택"-style optional tag next to the title */
  optionalTag?: ReactNode;
  /** Accent (any CSS color) for expanded ring / completed marker. Defaults to `var(--kit-accent)`. */
  accent?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Collapsible card with a header (leading marker, title, optional subtitle/badge)
 * and a body that shows when `open`. State-aware styling for expanded/completed.
 * Good for step lists, accordions, and disclosure sections.
 *
 * @example
 * <Collapsible leading={1} title="페르소나 분석" subtitle="스타일 파악"
 *   open={open === 1} onToggle={() => setOpen(open === 1 ? null : 1)} completed>
 *   <p>…</p>
 * </Collapsible>
 */
function CollapsibleMarker({ leading, completed, open, accentColor }: {
  leading: CollapsibleProps["leading"]; completed: boolean; open: boolean; accentColor: string;
}) {
  if (leading == null) return null;
  const markerStyle: CSSProperties | undefined =
    completed || open ? { backgroundColor: accentColor, color: "var(--kit-accent-fg,#fff)" } : undefined;
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black transition-all ${
        completed || open ? "" : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-400"
      }`}
      style={markerStyle}
    >
      {completed ? <CheckIcon /> : leading}
    </span>
  );
}

function CollapsibleTitle({ title, subtitle, badge, optionalTag, open, accentColor }: {
  title: React.ReactNode; subtitle: CollapsibleProps["subtitle"]; badge: CollapsibleProps["badge"];
  optionalTag: CollapsibleProps["optionalTag"]; open: boolean; accentColor: string;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">
        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
        {optionalTag != null && (
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-700">
            {optionalTag}
          </span>
        )}
      </span>
      {subtitle != null && !open && (
        <span className="mt-0.5 block truncate text-[11px] text-zinc-400 dark:text-zinc-500">{subtitle}</span>
      )}
      {badge != null && !open && (
        <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}>
          {badge}
        </span>
      )}
    </span>
  );
}

export function Collapsible({
  title,
  subtitle,
  badge,
  leading,
  open,
  onToggle,
  completed = false,
  optionalTag,
  accent,
  children,
  className = "",
}: CollapsibleProps) {
  const accentColor = accent ?? "var(--kit-accent)";

  return (
    <div
      className={`overflow-hidden rounded-xl transition-all ${
        open
          ? "bg-white shadow-md ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
          : "bg-zinc-50 dark:bg-zinc-800/50"
      } ${className}`}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <CollapsibleMarker leading={leading} completed={completed} open={open} accentColor={accentColor} />
        <CollapsibleTitle title={title} subtitle={subtitle} badge={badge} optionalTag={optionalTag} open={open} accentColor={accentColor} />
        <ChevronRightIcon
          size={14}
          className={`shrink-0 text-zinc-300 transition-transform dark:text-zinc-600 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <div className="mb-3 h-px bg-zinc-100 dark:bg-zinc-800" />
          {children}
        </div>
      )}
    </div>
  );
}
