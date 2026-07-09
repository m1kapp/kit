"use client";

import { formatTooltipDate, grassColor, type TooltipState } from "./grass-map-lib";
import type { GrassMapLabels } from "./grass-map";

type Labels = Required<GrassMapLabels>;

export function GrassTooltip({ tooltip, binary, unit, labels }: {
  tooltip: TooltipState; binary: boolean; unit: string; labels: Labels;
}) {
  return (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
            <span className="font-medium">{formatTooltipDate(tooltip.date)}</span>
            {!tooltip.isFuture && (
              <span className="ml-1.5 tabular-nums">
                {binary
                  ? (tooltip.count > 0 ? labels.done : labels.notDone)
                  : (tooltip.count > 0 ? `${tooltip.count.toLocaleString()}${unit}` : labels.noRecord)}
              </span>
            )}
            {tooltip.isFirst && (
              <span className="ml-1.5 text-[10px] opacity-70">🌱 {labels.firstRecord}</span>
            )}
            {tooltip.isToday && !tooltip.isFirst && (
              <span className="ml-1.5 text-[10px] opacity-70">{labels.today}</span>
            )}
          </div>
          <div className="mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 dark:border-t-zinc-100" />
        </div>
  );
}

export function GrassLegend({ binary, isDark, accent, labels }: {
  binary: boolean; isDark: boolean; accent: string; labels: Labels;
}) {
  return (
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
        {binary ? (
          <>
            <div className="w-3 h-3 rounded-xs" style={{ backgroundColor: isDark ? "rgb(39, 39, 42)" : "rgb(244, 244, 245)" }} />
            <span>{labels.notDone}</span>
            <svg className="ml-1 w-3 h-3" viewBox="0 0 13 13">
              <rect width="13" height="13" rx="2" fill={accent} />
              <path d="M3 6.5 l2.5 3.5 l5 -6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{labels.done}</span>
          </>
        ) : (
          <>
            <span>{labels.less}</span>
            {[0, 0.15, 0.35, 0.6, 0.85].map((ratio, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-xs"
                style={{ backgroundColor: ratio === 0 ? (isDark ? "rgb(39, 39, 42)" : "rgb(244, 244, 245)") : grassColor(Math.ceil(ratio * 10), 10, isDark, accent) }}
              />
            ))}
            <span>{labels.more}</span>
          </>
        )}
        <div className="ml-2 w-3 h-3 rounded-xs" style={{ backgroundColor: accent, opacity: 0.6 }} />
        <span>{labels.first}</span>
      </div>
  );
}
