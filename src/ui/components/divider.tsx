export interface DividerProps {
  /** 여백 프리셋. Default: "md" (mx-4 my-6 — 기존 동작) */
  spacing?: "none" | "sm" | "md";
  /** 선 색 (CSS color) — 클래스 충돌 없이 색만 바꿀 때 */
  color?: string;
  className?: string;
}

const SPACING_CLASSES = {
  none: "",
  sm: "mx-2 my-3",
  md: "mx-4 my-6",
} as const;

/**
 * Horizontal divider line.
 *
 * @example
 * <Divider />
 * <Divider spacing="none" color="rgba(255,255,255,0.1)" />
 */
export function Divider({ spacing = "md", color, className = "" }: DividerProps) {
  return (
    <div
      className={`h-px ${color ? "" : "bg-zinc-200 dark:bg-zinc-800"} ${SPACING_CLASSES[spacing]} ${className}`}
      style={color ? { background: color } : undefined}
    />
  );
}
