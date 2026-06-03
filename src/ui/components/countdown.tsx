import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface CountdownLabels {
  days?: string;
  hours?: string;
  mins?: string;
  secs?: string;
}

export interface CountdownProps {
  /** Target time — Date, epoch ms, or ISO/parseable date string */
  to: Date | number | string;
  /** Called once when the target is reached */
  onComplete?: () => void;
  /** Render when the target has passed. Default: a "+Nd" overdue line. */
  renderOverdue?: (daysOverdue: number) => ReactNode;
  /** Hide the days cell when 0 */
  hideZeroDays?: boolean;
  labels?: CountdownLabels;
  /** Separator/label color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

function parseTarget(to: Date | number | string): number {
  if (to instanceof Date) return to.getTime();
  if (typeof to === "number") return to;
  // Date-only strings ("2026-12-31") are parsed as LOCAL midnight (not UTC),
  // so the countdown lands on the user's calendar day regardless of timezone.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(to);
  return new Date(dateOnly ? `${to}T00:00:00` : to).getTime();
}

function diff(target: number, now: number) {
  const ms = target - now;
  const overdue = ms <= 0;
  const a = Math.abs(ms);
  return {
    overdue,
    days: Math.floor(a / 86_400_000),
    hours: Math.floor((a % 86_400_000) / 3_600_000),
    mins: Math.floor((a % 3_600_000) / 60_000),
    secs: Math.floor((a % 60_000) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-black tabular-nums leading-none text-zinc-900 dark:text-zinc-100">{value}</span>
      <span className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{label}</span>
    </div>
  );
}

/**
 * Live countdown to a target time (days/hours/mins/secs), ticking each second.
 * Renders an SSR-safe placeholder on first paint and supports overdue display.
 *
 * @example
 * <Countdown to="2026-12-31" onComplete={celebrate} />
 * <Countdown to={deadline} hideZeroDays />
 */
export function Countdown({
  to,
  onComplete,
  renderOverdue,
  hideZeroDays = false,
  labels,
  accent,
  className = "",
}: CountdownProps) {
  const target = parseTarget(to);
  const valid = !Number.isNaN(target);
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  const accentColor = accent ?? "var(--kit-accent)";
  const sepStyle: CSSProperties = { color: accentColor };
  const l = { days: "DAYS", hours: "HRS", mins: "MIN", secs: "SEC", ...labels };

  // Keep the latest onComplete without re-subscribing the interval.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!valid) return;
    let done = false;
    let id: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const d = diff(target, Date.now());
      setT(d);
      if (d.overdue && !done) {
        done = true;
        onCompleteRef.current?.();
        if (id !== undefined) clearInterval(id); // stop ticking once reached
      }
    };
    tick();
    if (!done) id = setInterval(tick, 1000);
    return () => { if (id !== undefined) clearInterval(id); };
  }, [target, valid]);

  if (!valid) return null;

  if (!t) {
    return <div className={`text-2xl font-black tabular-nums text-zinc-300 dark:text-zinc-700 ${className}`}>-- : -- : -- : --</div>;
  }

  if (t.overdue) {
    return (
      <div className={`text-xl font-black ${className}`} style={sepStyle}>
        {renderOverdue ? renderOverdue(t.days) : `+${t.days}d`}
      </div>
    );
  }

  const showDays = !hideZeroDays || t.days > 0;

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      {showDays && (
        <>
          <Cell value={String(t.days)} label={l.days} />
          <span className="pb-4 text-2xl font-black" style={sepStyle}>:</span>
        </>
      )}
      <Cell value={pad(t.hours)} label={l.hours} />
      <span className="pb-4 text-2xl font-black" style={sepStyle}>:</span>
      <Cell value={pad(t.mins)} label={l.mins} />
      <span className="pb-4 text-2xl font-black" style={sepStyle}>:</span>
      <Cell value={pad(t.secs)} label={l.secs} />
    </div>
  );
}
