import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDownIcon } from "./_icons";

export interface SelectOption<T extends string | number> {
  value: T;
  label: ReactNode;
  /** Optional count shown on the right (e.g. number of matches) */
  count?: number;
  /** Disable selection (e.g. count === 0) */
  disabled?: boolean;
}

export interface SelectProps<T extends string | number> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Trigger text when nothing is selected (default: "전체") */
  placeholder?: ReactNode;
  /** Show a top "clear" row that sets value to null (default: true) */
  allowClear?: boolean;
  /** Label for the clear row (default: "전체") */
  clearLabel?: ReactNode;
  /** Accent (any CSS color) for the selected trigger. Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

/**
 * Styled dropdown select: a trigger button + an anchored options list with
 * optional count badges and disabled options. Closes on outside click / Escape.
 *
 * @example
 * <Select value={cat} onChange={setCat} placeholder="카테고리"
 *   options={[{ value: "a", label: "초급", count: 12 }, { value: "b", label: "고급", count: 0, disabled: true }]} />
 */
export function Select<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "전체",
  allowClear = true,
  clearLabel = "전체",
  accent,
  className = "",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const accentColor = accent ?? "var(--kit-accent)";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const triggerStyle: CSSProperties | undefined =
    value != null ? { backgroundColor: accentColor, borderColor: accentColor, color: "var(--kit-accent-fg,#fff)" } : undefined;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-all ${
          value != null
            ? ""
            : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
        style={triggerStyle}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDownIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200/70 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          {allowClear && (
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors ${
                value == null
                  ? "bg-zinc-50 font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <span>{clearLabel}</span>
              {value == null && <span className="text-[11px] text-zinc-400">✓</span>}
            </button>
          )}
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                disabled={opt.disabled}
                onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false); } }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors ${
                  opt.disabled
                    ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                    : active
                      ? "font-semibold"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
                style={active && !opt.disabled ? { color: accentColor } : undefined}
              >
                <span className="truncate">{opt.label}</span>
                {opt.count != null && (
                  <span className={`ml-2 shrink-0 text-[11px] ${opt.disabled ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                    {opt.count > 0 ? opt.count : "—"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
