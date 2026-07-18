"use client";

/**
 * label 없는 단독 입력 프리미티브 — Field(label 필수)와 같은 스타일 토큰.
 * 폼 밖 한 줄 입력(검색창, URL 붙여넣기 등)에 사용.
 */

const INPUT_CLASS =
  "w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-400 dark:focus:border-zinc-500 disabled:opacity-50";

interface InputBaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export interface InputProps extends InputBaseProps {
  /** input type (text, email, tel, search…) */
  type?: string;
  onEnter?: () => void;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  onFocus,
  onBlur,
  onEnter,
  className = "",
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onEnter ? (e) => { if (e.key === "Enter") onEnter(); } : undefined}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${INPUT_CLASS} ${className}`}
    />
  );
}

export interface TextareaProps extends InputBaseProps {
  rows?: number;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
  onFocus,
  onBlur,
  className = "",
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${INPUT_CLASS} resize-none leading-relaxed ${className}`}
    />
  );
}
