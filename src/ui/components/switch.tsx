import { type CSSProperties } from "react";

export interface SwitchProps {
  /** Whether the switch is on */
  checked: boolean;
  /** Called with the next value when toggled */
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** On-state track color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  /** Accessible label */
  "aria-label"?: string;
  className?: string;
}

/**
 * On/off toggle switch. Pill track + sliding knob, adapts to dark mode.
 * On-state color follows `--kit-accent` (set via `<AppShell accent>`) or the `accent` prop.
 *
 * @example
 * <Switch checked={on} onChange={setOn} aria-label="알림" />
 * <Switch checked={on} onChange={setOn} accent="#e2603f" />
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  accent,
  className = "",
  ...rest
}: SwitchProps) {
  const onStyle: CSSProperties | undefined = checked
    ? { backgroundColor: accent ?? "var(--kit-accent)" }
    : undefined;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest["aria-label"]}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        checked ? "" : "bg-zinc-200 dark:bg-zinc-700"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      style={onStyle}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
