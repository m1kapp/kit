"use client";

import { useCallback, useState, useMemo, useRef } from "react";
import { useEscapeKey } from "../hooks/use-escape-key";
import {
  formatTooltipDate, toLocalDateStr, grassColor, buildYearGrid, cellFillColor,
  CELL_SIZE, STEP, DAYS_LABEL,
  type TooltipState,
} from "./grass-map-lib";
import { GrassTooltip, GrassLegend } from "./grass-map-parts";

export interface GrassMapData {
  date: string;  // "YYYY-MM-DD"
  count: number;
}

export interface GrassMapLabels {
  firstRecord?: string;
  noRecord?: string;
  today?: string;
  less?: string;
  more?: string;
  first?: string;
  /** binary 모드 범례 라벨. Default: "완료" */
  done?: string;
  /** binary 모드 범례 라벨. Default: "미완료" */
  notDone?: string;
}

export interface GrassMapProps {
  data: GrassMapData[];
  accent: string;
  isDark?: boolean;
  /** Unit label appended to count in tooltip. e.g. "명", "commits". Default: "" */
  unit?: string;
  /** true면 count > 0을 모두 동일한 accent 색으로 표시 (했다/안했다 2색) */
  binary?: boolean;
  /** Override default Korean labels for i18n */
  labels?: GrassMapLabels;
}

export function GrassMap({ data, accent, isDark = false, unit = "", binary = false, labels: _labels }: GrassMapProps) {
  const labels = {
    firstRecord: "첫 기록",
    noRecord: "기록 없음",
    today: "오늘",
    less: "Less",
    more: "More",
    first: "1st",
    done: "완료",
    notDone: "미완료",
    ..._labels,
  };
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const dismissTooltip = useCallback(() => setTooltip(null), []);

  useEscapeKey(tooltip !== null, dismissTooltip);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    for (const d of data) {
      const parsed = new Date(d.date);
      if (!isNaN(parsed.getTime())) years.add(parsed.getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const validData = useMemo(
    () => data.filter((d) => !isNaN(new Date(d.date).getTime())),
    [data]
  );

  const countMap = useMemo(
    () => new Map(validData.map((d) => [d.date, d.count])),
    [validData]
  );

  const firstDay = validData.length > 0 ? validData[0].date : null;
  const firstDayFormatted = firstDay
    ? new Date(firstDay).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const { days, maxCount, totalCols, monthLabels } = buildYearGrid(countMap, selectedYear, today);

  const leftPad = 36;
  const topPad = 22;
  const svgWidth = leftPad + totalCols * STEP;
  const svgHeight = topPad + 7 * STEP;

  return (
    <div ref={outerRef} className="relative space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedYear === year
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        {firstDayFormatted && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {labels.firstRecord} <span className="font-medium text-zinc-600 dark:text-zinc-400">{firstDayFormatted}</span>
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="block mx-auto"
          onMouseLeave={() => setTooltip(null)}
        >
          {monthLabels.map((m, i) => (
            <text
              key={`${m.label}-${i}`}
              x={leftPad + m.col * STEP}
              y={13}
              className="fill-zinc-400"
              fontFamily="system-ui, sans-serif"
              fontSize={10}
            >
              {m.label}
            </text>
          ))}

          {DAYS_LABEL.map((label, i) =>
            label ? (
              <text
                key={i}
                x={0}
                y={topPad + i * STEP + CELL_SIZE - 2}
                className="fill-zinc-300"
                fontFamily="system-ui, sans-serif"
                fontSize={9}
              >
                {label}
              </text>
            ) : null
          )}

          {days.map((day) => {
            const isToday = day.date === todayStr;
            const isFirst = day.date === firstDay;
            const cellFill = cellFillColor(day, isFirst, { binary, isDark, accent, maxCount });

            const cx = leftPad + day.col * STEP;
            const cy = topPad + day.row * STEP;

            const showCheck = binary && !day.isOutOfRange && !day.isFuture && day.count > 0;

            return (
              <g
                key={day.date}
                style={{ cursor: day.isOutOfRange ? "default" : "pointer" }}
                onMouseEnter={(e) => {
                  if (day.isOutOfRange) return;
                  const svg = e.currentTarget.ownerSVGElement;
                  if (!svg) return;
                  const svgRect = svg.getBoundingClientRect();
                  const outer = outerRef.current;
                  if (!outer) return;
                  const outerRect = outer.getBoundingClientRect();
                  setTooltip({
                    x: cx + svgRect.left - outerRect.left + CELL_SIZE / 2,
                    y: cy + svgRect.top - outerRect.top,
                    date: day.date,
                    count: day.count,
                    isFirst,
                    isToday,
                    isFuture: day.isFuture,
                  });
                }}
              >
                <rect
                  x={cx}
                  y={cy}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={3}
                  fill={cellFill}
                  stroke={isFirst ? accent : "none"}
                  strokeWidth={isFirst ? 1.5 : 0}
                />
                {showCheck && (
                  <path
                    d={`M${cx + 3} ${cy + 6.5} l2.5 3.5 l5 -6`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {tooltip && <GrassTooltip tooltip={tooltip} binary={binary} unit={unit} labels={labels} />}

      <GrassLegend binary={binary} isDark={isDark} accent={accent} labels={labels} />
    </div>
  );
}
