import { type ReactNode } from "react";

export interface FieldProps {
  /** Label shown above (or beside, when `inline`) the input */
  label: ReactNode;
  value: string;
  /** Omit to render a read-only display row */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** input type (text, email, tel…). Ignored when `multiline`. */
  type?: string;
  /** Render a textarea instead of an input */
  multiline?: boolean;
  rows?: number;
  readOnly?: boolean;
  disabled?: boolean;
  /** Helper text under the field */
  hint?: ReactNode;
  /** Label beside the input on one line (settings-row style) instead of stacked */
  inline?: boolean;
  className?: string;
}

const INPUT_CLASS =
  "w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-400 dark:focus:border-zinc-500 disabled:opacity-50 read-only:bg-transparent read-only:border-transparent read-only:px-0";

/**
 * Labeled input row for forms. Stacked by default, or `inline` for a
 * settings-style "label … value" row. Supports textarea via `multiline`.
 *
 * @example
 * <Field label="이름" value={name} onChange={setName} placeholder="이름" />
 * <Field label="메모" value={memo} onChange={setMemo} multiline rows={3} />
 * <Field label="이메일" value={email} inline readOnly />
 */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 3,
  readOnly = false,
  disabled = false,
  hint,
  inline = false,
  className = "",
}: FieldProps) {
  const control = multiline ? (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly || !onChange}
      disabled={disabled}
      rows={rows}
      className={`${INPUT_CLASS} resize-none leading-relaxed`}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly || !onChange}
      disabled={disabled}
      className={`${INPUT_CLASS} ${inline ? "text-right" : ""}`}
    />
  );

  if (inline) {
    return (
      <div className={`flex items-center gap-3 py-1.5 ${className}`}>
        <span className="shrink-0 text-base text-zinc-500 dark:text-zinc-400">{label}</span>
        <div className="flex-1 min-w-0">{control}</div>
      </div>
    );
  }

  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      {control}
      {hint != null && <span className="mt-1 block text-[12px] text-zinc-400 dark:text-zinc-500">{hint}</span>}
    </label>
  );
}
