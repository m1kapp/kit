import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

  /*
    메뉴는 fixed 로 띄운다 — 트리거가 overflow 스크롤 컨테이너 안에 있으면
    absolute 메뉴가 컨테이너에 잘려 나간다(ytcc 편집기에서 실측). 열 때 트리거
    위치를 재서 화면 좌표에 그리고, 아래 공간이 모자라면 위로 뒤집는다.
  */
  const MENU_MAX = 220;
  const [box, setBox] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const rows = options.length + (allowClear ? 1 : 0);
    const up = below < Math.min(MENU_MAX, rows * 40 + 8) && r.top > below;
    setBox({ left: r.left, top: up ? r.top : r.bottom + 4, width: r.width, up });
    // 스크롤·리사이즈 중엔 좌표가 어긋나므로 그냥 닫는다(따라다니게 하면 더 산만하다)
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // pointerdown (not mousedown) — iOS Safari doesn't synthesize mouse
    // events for taps on non-interactive elements, so mousedown never fires
    // and the menu stays stuck open.
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
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

      {open && box && (
        <div
          className="fixed z-[90] overflow-y-auto rounded-xl border border-zinc-200/70 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
          style={{
            left: box.left,
            width: box.width,
            maxHeight: MENU_MAX,
            ...(box.up ? { bottom: window.innerHeight - box.top + 4 } : { top: box.top }),
          }}
        >
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
