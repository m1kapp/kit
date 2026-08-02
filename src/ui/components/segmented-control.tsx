import { type CSSProperties, type ReactNode } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Active-segment label color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

/**
 * Inline segmented toggle (e.g. 오늘 / 이번 주). The active segment lifts onto a
 * card; its label takes the accent color. For global bottom nav use `TabBar` instead.
 *
 * @example
 * <SegmentedControl
 *   value={view}
 *   onChange={setView}
 *   options={[{ value: "today", label: "오늘" }, { value: "week", label: "이번 주" }]}
 * />
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accent,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex shrink-0 gap-0.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1 ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const activeStyle: CSSProperties | undefined = active
          ? { color: accent ?? "var(--kit-accent)" }
          : undefined;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition-all ${
              active
                ? "bg-white dark:bg-zinc-700 shadow-sm"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
            style={activeStyle}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
