"use client";

import { type ReactNode } from "react";

type IconButtonVariant = "ghost" | "outline";
type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps {
  icon: ReactNode;
  /** 접근성 라벨(aria-label) — 아이콘만 있는 버튼이므로 사실상 필수 */
  label?: string;
  onClick?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost:
    "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800",
  outline:
    "border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

/**
 * 아이콘 전용 정사각 버튼 — Button(텍스트용)과 달리 ghost/outline 스타일.
 *
 * @example
 * <IconButton icon={<RefreshCw size={18} />} label="새로고침" onClick={reload} />
 */
export function IconButton({
  icon,
  label,
  onClick,
  variant = "ghost",
  size = "md",
  disabled = false,
  className = "",
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon}
    </button>
  );
}
