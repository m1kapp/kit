"use client";

import type { CSSProperties } from "react";

/* ─────────────────────────────────────────
   작은 차트 프리미티브 셋
   kit 의 BarList 는 가로 전용이라, 세로 막대·2분할 비율 바·누적 곡선을
   앱마다 손 SVG 로 다시 그리고 있었다(claude-rank·web·median-income-calc).
   전부 의존성 없는 순수 렌더링이다 — 데이터 가공은 앱이 한다.
───────────────────────────────────────── */

export interface ColumnDatum {
  /** 축 라벨. weekday 를 켜면 ISO 날짜("2026-09-03")로 요일을 그린다. */
  label: string;
  value: number;
  /** 이 막대만 다른 색. */
  color?: string;
  /** 아직 오지 않은 구간(예측). 반투명하게 그리고 경계에 점선을 세운다. */
  projected?: boolean;
}

export interface ColumnChartProps {
  data: ColumnDatum[];
  /** 막대 색. 기본: var(--kit-accent) */
  color?: string;
  /** 실측 구간 평균에 점선을 긋는다. */
  showAverage?: boolean;
  averageLabel?: string;
  /** 평균·타이틀 표기용 포맷터. */
  format?: (n: number) => string;
  /** 축 라벨을 "일 + 요일 첫 글자"로 그린다(label 이 ISO 날짜일 때). */
  weekday?: boolean;
  /** 예측 경계 라벨. 기본: "예상 →" */
  projectedLabel?: string;
  height?: number;
  className?: string;
}

const KO_WEEKDAY = ["월", "화", "수", "목", "금", "토", "일"];

/** 세로 막대 + 평균선 + 예측 구간. 일별·주별 사용량류에 맞다. */
export function ColumnChart({
  data,
  color,
  showAverage = false,
  averageLabel = "평균",
  format = (n) => `${Math.round(n)}`,
  weekday = false,
  projectedLabel = "예상 →",
  height = 120,
  className = "",
}: ColumnChartProps) {
  if (!data.length) return null;
  const barColor = color ?? "var(--kit-accent)";
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const real = data.filter((d) => !d.projected);
  const avg = (real.length ? real : data).reduce((a, d) => a + d.value, 0) / (real.length || data.length);
  const projStart = data.findIndex((d) => d.projected);

  const dayLabel = (iso: string) => {
    const wd = (new Date(`${iso}T00:00:00`).getDay() + 6) % 7; // 월=0
    return (
      <>
        {Number(iso.slice(8))}
        <span className="block text-[8px] opacity-70">{KO_WEEKDAY[wd]}</span>
      </>
    );
  };

  return (
    <div
      className={`relative flex items-end gap-px border-b-2 border-zinc-200 pt-1.5 dark:border-zinc-700 ${className}`}
      style={{ height }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d.label} · ${format(d.value)}${d.projected ? ` (${projectedLabel.replace(/\s*→\s*$/, "")})` : ""}`}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
        >
          <div
            className="w-[76%] rounded-t-[3px]"
            style={{
              height: `${(d.value / max) * 100}%`,
              minHeight: d.value ? 1 : 0,
              background: d.color ?? barColor,
              opacity: d.projected ? 0.3 : 1,
            }}
          />
          <div className="mt-0.5 text-center text-[8px] leading-tight text-zinc-400 dark:text-zinc-500">
            {weekday ? dayLabel(d.label) : d.label}
          </div>
        </div>
      ))}
      {projStart > 0 && (
        <div
          className="absolute bottom-0 top-0 border-l border-dashed border-zinc-400 opacity-60"
          style={{ left: `${(projStart / data.length) * 100}%` }}
        >
          <span className="absolute -top-0.5 left-1 text-[8px] text-zinc-400">{projectedLabel}</span>
        </div>
      )}
      {showAverage && (
        <div
          className="absolute left-0 right-0 h-0 border-t-[1.5px] border-dashed border-zinc-500"
          style={{ bottom: `${Math.min((avg / max) * 100, 100)}%` }}
        >
          <span className="absolute -top-3.5 right-0 rounded bg-white/85 px-1 text-[9px] font-bold text-zinc-600 dark:bg-zinc-900/85 dark:text-zinc-300">
            {averageLabel} {format(avg)}
          </span>
        </div>
      )}
    </div>
  );
}

export interface DuoBarSide {
  value: number;
  label: string;
  color: string;
}

export interface DuoBarProps {
  /** 위에 서는 제목. 오른쪽에 합계가 붙는다. */
  title?: string;
  a: DuoBarSide;
  b: DuoBarSide;
  format?: (n: number) => string;
  className?: string;
}

/** 두 값의 비율 스택 바 + 하단 범례. 입력/출력·모바일/데스크톱 같은 2분할에. */
export function DuoBar({ title, a, b, format = (n) => n.toLocaleString("ko-KR"), className = "" }: DuoBarProps) {
  const sum = a.value + b.value || 1;
  const leg = (side: DuoBarSide) => (
    <span className="flex items-center gap-1.5">
      <i className="inline-block h-2 w-2 rounded-[2px]" style={{ background: side.color }} />
      <span className="text-zinc-500 dark:text-zinc-400">{side.label}</span>
      <b>{format(side.value)}</b>
      <span className="text-zinc-400">· {Math.round((side.value / sum) * 100)}%</span>
    </span>
  );
  return (
    <div className={className}>
      {title && (
        <div className="mb-1.5 flex items-baseline text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
          <span>{title}</span>
          <span className="ml-auto font-extrabold text-zinc-500 tabular-nums">{format(sum)}</span>
        </div>
      )}
      <div className="flex h-[18px] gap-px overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
        <span style={{ width: `${(a.value / sum) * 100}%`, background: a.color }} />
        <span style={{ width: `${(b.value / sum) * 100}%`, background: b.color }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px]">
        {leg(a)}
        {leg(b)}
      </div>
    </div>
  );
}

export interface CumulativeCurveProps {
  /** 일별 증가량(누적이 아니라 그날 값). */
  daily: { date: string; count: number }[];
  /** 지금까지의 총합 — 마일스톤 달성 판정에 쓴다. */
  total: number;
  /** 오늘 값이 있으면 끝점에 라이브 점을 찍는다. */
  todayCount?: number;
  /** 곡선·면적 색. */
  accent?: string;
  /** 교차점 배지를 세울 마일스톤. */
  milestones?: { value: number; label: string }[];
  /** 데이터가 없을 때 보일 말. */
  empty?: React.ReactNode;
  className?: string;
}

const DEFAULT_MILESTONES = [
  { value: 1_000, label: "1K" },
  { value: 10_000, label: "10K" },
  { value: 100_000, label: "100K" },
  { value: 1_000_000, label: "1M" },
];

const CURVE_W = 300;
const PAD_LEFT = 34; // Y축 라벨 공간
const CHART_H = 90;
const LABEL_H = 18;

function fmtY(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}K`;
  return Math.round(v).toString();
}

/** 누적 곡선 지오메트리 — 경로·눈금·마일스톤 교차점 계산 (순수 함수) */
function buildCurve(daily: { date: string; count: number }[], total: number, milestones: { value: number; label: string }[]) {
  const cumulative: number[] = [];
  let sum = 0;
  for (const d of daily) {
    sum += d.count;
    cumulative.push(sum);
  }
  if (cumulative.length === 0 || total === 0) return null;

  const n = cumulative.length;
  const chartW = CURVE_W - PAD_LEFT;
  const hasCrossing = milestones.some((m) => total >= m.value);
  const padTop = hasCrossing ? 28 : 8;
  const H = padTop + CHART_H + LABEL_H;
  const baseY = padTop + CHART_H;

  const dataMax = Math.max(...cumulative);
  const yAxisMax = dataMax * 1.25;
  const nextMs = milestones.find((m) => total < m.value);
  const showGoalLine = !!nextMs && nextMs.value <= yAxisMax * 1.05;

  const xOf = (i: number) => PAD_LEFT + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const yOf = (val: number) => padTop + CHART_H - Math.min(val / yAxisMax, 1) * CHART_H;
  const yTicks = [dataMax, dataMax / 2].map((v) => ({ y: yOf(v), label: fmtY(v) }));
  const pts = cumulative.map((v, i) => ({ x: xOf(i), y: yOf(v) }));

  let linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    linePath += ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)} ${cpx.toFixed(1)} ${curr.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${baseY} L ${pts[0].x.toFixed(1)} ${baseY} Z`;

  const crossings: { x: number; y: number; label: string }[] = [];
  for (const ms of milestones) {
    if (total < ms.value) break;
    const i = cumulative.findIndex((v) => v >= ms.value);
    if (i >= 0) crossings.push({ x: xOf(i), y: yOf(cumulative[i]), label: ms.label });
  }

  const labelIdxs = [...new Set([0, n > 6 ? Math.round(n / 2) : -1, n - 1].filter((i) => i >= 0 && i < n))];
  return { n, H, baseY, nextMs, showGoalLine, yOf, yTicks, pts, linePath, areaPath, crossings, labelIdxs };
}

/** 누적 성장 곡선 + 마일스톤 배지 + 다음 목표선. 방문자·판매·적립 총량류에. */
export function CumulativeCurve({
  daily,
  total,
  todayCount = 0,
  accent = "#2563eb",
  milestones = DEFAULT_MILESTONES,
  empty = null,
  className = "",
}: CumulativeCurveProps) {
  const geo = buildCurve(daily, total, milestones);
  if (!geo) {
    return empty ? <div className="flex h-24 items-center justify-center text-[12px] text-zinc-400">{empty}</div> : null;
  }
  const { H, baseY, nextMs, showGoalLine, yOf, yTicks, pts, linePath, areaPath, crossings, labelIdxs } = geo;
  const lastPt = pts[pts.length - 1];
  const gradId = `kit-cc-${accent.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${CURVE_W} ${H}`} className={`w-full ${className}`} style={{ overflow: "visible" } as CSSProperties} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_LEFT} x2={CURVE_W} y1={t.y} y2={t.y} stroke="currentColor" strokeOpacity="0.08" />
          <text x={PAD_LEFT - 5} y={t.y + 3} textAnchor="end" fontSize="8.5" fill="currentColor" fillOpacity="0.4">
            {t.label}
          </text>
        </g>
      ))}

      {showGoalLine && nextMs && (
        <g>
          <line x1={PAD_LEFT} x2={CURVE_W} y1={yOf(nextMs.value)} y2={yOf(nextMs.value)} stroke={accent} strokeOpacity="0.35" strokeDasharray="3 3" />
          <text x={CURVE_W} y={yOf(nextMs.value) - 4} textAnchor="end" fontSize="8.5" fontWeight="700" fill={accent} fillOpacity="0.7">
            {nextMs.label}
          </text>
        </g>
      )}

      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" />

      {crossings.map((c) => (
        <g key={c.label}>
          <line x1={c.x} x2={c.x} y1={c.y} y2={baseY} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="2 3" />
          <circle cx={c.x} cy={c.y} r="3" fill={accent} stroke="#fff" strokeWidth="1.5" />
          <g transform={`translate(${Math.min(Math.max(c.x, PAD_LEFT + 12), CURVE_W - 12)}, ${c.y - 14})`}>
            <rect x="-12" y="-9" width="24" height="13" rx="6.5" fill={accent} />
            <text y="1" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">
              {c.label}
            </text>
          </g>
        </g>
      ))}

      {todayCount > 0 && (
        <g>
          <circle cx={lastPt.x} cy={lastPt.y} r="5" fill={accent} opacity="0.25">
            <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={lastPt.x} cy={lastPt.y} r="3" fill={accent} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}

      {labelIdxs.map((i) => (
        <text
          key={i}
          x={pts[i].x}
          y={baseY + 12}
          textAnchor={i === 0 ? "start" : i === geo.n - 1 ? "end" : "middle"}
          fontSize="8.5"
          fill="currentColor"
          fillOpacity="0.4"
        >
          {daily[i]?.date.slice(5).replace("-", "/")}
        </text>
      ))}
    </svg>
  );
}
