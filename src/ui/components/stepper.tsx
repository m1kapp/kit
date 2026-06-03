import { type CSSProperties, type ReactNode } from "react";
import { CheckIcon } from "./_icons";

export interface Step {
  label: ReactNode;
  /** Optional icon/emoji shown in the badge while incomplete */
  icon?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  /** Active step index (0-based) */
  current: number;
  /** Last completed index (default: current - 1). Steps ≤ this show a check. */
  completedThrough?: number;
  /** Makes steps up to `current` clickable */
  onStepClick?: (index: number) => void;
  /** Active/complete color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

/**
 * Horizontal multi-step progress indicator with connectors. Steps before the
 * cursor show a check, the current step is highlighted, the rest are muted.
 * Great for wizards, multi-phase flows, and onboarding.
 *
 * @example
 * <Stepper current={phase} onStepClick={setPhase} steps={[
 *   { label: "분석", icon: "📝" },
 *   { label: "준비", icon: "📸" },
 *   { label: "생성", icon: "✨" },
 * ]} />
 */
export function Stepper({
  steps,
  current,
  completedThrough,
  onStepClick,
  accent,
  className = "",
}: StepperProps) {
  const accentColor = accent ?? "var(--kit-accent)";
  const lastDone = completedThrough ?? current - 1;

  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, i) => {
        const complete = i <= lastDone;
        const active = i === current;
        const clickable = !!onStepClick && i <= current;
        const badgeStyle: CSSProperties | undefined =
          complete || active ? { backgroundColor: accentColor, color: "var(--kit-accent-fg,#fff)" } : undefined;
        const labelStyle: CSSProperties | undefined = active ? { color: accentColor } : undefined;

        return (
          <div key={i} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => clickable && onStepClick!(i)}
              disabled={!clickable}
              className={`flex items-center gap-2 transition-all disabled:cursor-default ${
                active ? "opacity-100" : "opacity-50 enabled:hover:opacity-80"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black transition-all ${
                  complete || active ? "" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
                style={badgeStyle}
              >
                {complete ? <CheckIcon /> : (step.icon ?? i + 1)}
              </span>
              <span className="flex flex-col items-start">
                <span
                  className={`text-[8px] font-bold uppercase tracking-widest ${
                    active ? "" : "text-zinc-400 dark:text-zinc-500"
                  }`}
                  style={labelStyle}
                >
                  {i + 1}/{steps.length}
                </span>
                <span
                  className={`text-[11px] font-bold ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`}
                >
                  {step.label}
                </span>
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className="mx-2 flex flex-1 items-center">
                <span
                  className={`h-px flex-1 transition-all ${complete ? "" : "bg-zinc-200 dark:bg-zinc-700"}`}
                  style={complete ? { backgroundColor: accentColor } : undefined}
                />
                <span
                  className={`mx-0.5 h-1 w-1 rounded-full transition-all ${complete ? "" : "bg-zinc-200 dark:bg-zinc-700"}`}
                  style={complete ? { backgroundColor: accentColor } : undefined}
                />
                <span
                  className={`h-px flex-1 transition-all ${complete ? "" : "bg-zinc-200 dark:bg-zinc-700"}`}
                  style={complete ? { backgroundColor: accentColor } : undefined}
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
