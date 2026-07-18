"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { subscribeFetchActivity, getFetchActiveCount } from "../../fetch/activity";

export interface FetchProgressProps {
  /** Bar color. Default: `var(--kit-accent)` fallback zinc-900 */
  color?: string;
  /**
   * Visual style. Default: "sweep".
   * - `"sweep"` — a short gradient segment sweeps left-to-right in a loop
   *   (indeterminate; honest about unknown duration)
   * - `"creep"` — nprogress-style bar that creeps toward 90%, then snaps
   *   to 100% and fades on completion
   */
  variant?: "sweep" | "creep";
  /**
   * Explicit control. When set, overrides the global useFetch activity
   * tracking — e.g. `active={revalidating}` for a single request's bar.
   * When omitted, the bar shows while ANY useFetch request is in flight.
   */
  active?: boolean;
  /**
   * Distance from the top of the positioned ancestor — a number of px, or any
   * CSS length (e.g. `"calc(3.5rem + env(safe-area-inset-top))"` to sit below
   * `AppShellHeader`, whose height grows with the safe-area inset on notched
   * devices). Default: 0
   */
  top?: number | string;
  /** Bar thickness in px. Default: 3 */
  height?: number;
  className?: string;
}

const KEYFRAMES =
  "@keyframes kit-fetch-sweep{from{left:-40%}to{left:100%}}" +
  "@keyframes kit-fetch-creep{0%{width:0%}15%{width:38%}55%{width:70%}100%{width:90%}}";

const getServerActiveCount = () => 0;

/**
 * Slim top loading bar for stale-while-revalidate UIs — content stays
 * visible and this bar is the only loading signal. By default it is driven
 * by global useFetch activity (any request, including background
 * revalidation); pass `active` to control it explicitly.
 *
 * Position is `absolute`, so place it inside a positioned container —
 * e.g. directly inside `<AppShell>` (which is `relative`), with `top` set
 * to the header height to sit just below `<AppShellHeader>`.
 */
export function FetchProgress({
  color = "var(--kit-accent, #18181b)",
  variant = "sweep",
  active,
  top = 0,
  height = 3,
  className = "",
}: FetchProgressProps) {
  const globalBusy =
    useSyncExternalStore(subscribeFetchActivity, getFetchActiveCount, getServerActiveCount) > 0;
  const busy = active ?? globalBusy;

  // idle → run → done (brief fade-out) → idle
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  // Remounts the bar each run so the creep animation restarts from 0%
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (busy) {
      setPhase((p) => {
        if (p !== "run") setRunId((id) => id + 1);
        return "run";
      });
      return;
    }
    setPhase((p) => (p === "run" ? "done" : p));
  }, [busy]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setPhase("idle"), 500);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "idle") return null;

  const done = phase === "done";
  const fade: CSSProperties = done ? { opacity: 0, transition: "opacity 400ms ease 100ms" } : {};

  const bar: CSSProperties =
    variant === "sweep"
      ? {
          position: "absolute",
          top: 0,
          height: "100%",
          width: "38%",
          borderRadius: height,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: done ? "none" : "kit-fetch-sweep 1.1s ease-in-out infinite",
          ...fade,
        }
      : {
          height: "100%",
          borderRadius: `0 ${height}px ${height}px 0`,
          background: color,
          ...(done
            ? { width: "100%", ...fade }
            : { animation: "kit-fetch-creep 5s cubic-bezier(0.2,0.7,0.4,1) forwards" }),
        };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-30 overflow-hidden ${className}`}
      style={{ top, height }}
    >
      <style href="m1kapp-kit-fetch-progress" precedence="default">{KEYFRAMES}</style>
      <div key={runId} style={bar} />
    </div>
  );
}
