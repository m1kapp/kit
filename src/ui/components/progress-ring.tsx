import { type ReactNode } from "react";

export interface ProgressRingProps {
  /** Current value */
  value: number;
  /** Max value (default 1, so `value` is treated as a 0–1 fraction) */
  max?: number;
  /** Diameter in px (default 96) */
  size?: number;
  /** Stroke width in px (default 8) */
  thickness?: number;
  /** Progress stroke color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  /** Center content (e.g. the number). Defaults to a percentage. */
  children?: ReactNode;
  /** Animate the stroke from empty on mount (default: true) */
  animate?: boolean;
  className?: string;
}

/**
 * Circular progress ring with a center slot. Good for scores, completion, and
 * quota indicators.
 *
 * @example
 * <ProgressRing value={7} max={10}><span className="text-2xl font-black">7</span></ProgressRing>
 * <ProgressRing value={0.42} size={64} />
 */
export function ProgressRing({
  value,
  max = 1,
  size = 96,
  thickness = 8,
  accent,
  children,
  animate = true,
  className = "",
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const r = 50 - thickness / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const accentColor = accent ?? "var(--kit-accent)";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth={thickness} className="stroke-zinc-200 dark:stroke-zinc-800" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={accentColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={animate ? { transition: "stroke-dashoffset 1s ease-out" } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">{Math.round(pct * 100)}%</span>
        )}
      </div>
    </div>
  );
}
