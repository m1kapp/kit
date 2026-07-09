export function formatTooltipDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}월 ${parseInt(d)}일`;
}

export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const CELL_SIZE = 13;
export const GAP = 3;
export const STEP = CELL_SIZE + GAP;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DAYS_LABEL = ["", "Mon", "", "Wed", "", "Fri", ""];

export interface TooltipState {
  x: number;
  y: number;
  date: string;
  count: number;
  isFirst: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function grassColor(count: number, max: number, isDark: boolean, accent: string): string {
  if (count === 0) return isDark ? "rgb(39, 39, 42)" : "rgb(244, 244, 245)";
  const ratio = count / max;
  const [r, g, b] = hexToRgb(accent);

  if (isDark) {
    const opacities = [0.25, 0.4, 0.6, 0.9];
    const o = ratio > 0.75 ? opacities[3] : ratio > 0.5 ? opacities[2] : ratio > 0.25 ? opacities[1] : opacities[0];
    return `rgba(${r}, ${g}, ${b}, ${o})`;
  }
  const mixes = [0.8, 0.6, 0.4, 0.15];
  const m = ratio > 0.75 ? mixes[3] : ratio > 0.5 ? mixes[2] : ratio > 0.25 ? mixes[1] : mixes[0];
  return `rgb(${Math.round(r + (255 - r) * m)}, ${Math.round(g + (255 - g) * m)}, ${Math.round(b + (255 - b) * m)})`;
}

export interface GridDay {
  date: string;
  count: number;
  col: number;
  row: number;
  isOutOfRange: boolean;
  isFuture: boolean;
}

/** 선택 연도의 주 단위 그리드 + 월 라벨 계산 (순수 함수) */
export function buildYearGrid(countMap: Map<string, number>, selectedYear: number, today: Date) {
  const yearStart = new Date(selectedYear, 0, 1);
  const yearEnd = new Date(selectedYear, 11, 31);

  const start = new Date(yearStart);
  start.setDate(start.getDate() - start.getDay());

  const days: GridDay[] = [];
  const totalDays = Math.ceil((yearEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    if (date > yearEnd) break;
    const key = toLocalDateStr(date);
    const col = Math.floor(i / 7);
    const row = i % 7;
    const isOutOfRange = date < yearStart;
    const isFuture = date > today;
    days.push({ date: key, count: countMap.get(key) || 0, col, row, isOutOfRange, isFuture });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const totalCols = days.length > 0 ? Math.max(...days.map((d) => d.col)) + 1 : 1;

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (const day of days) {
    if (day.row !== 0 || day.isOutOfRange) continue;
    const month = new Date(day.date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], col: day.col });
      lastMonth = month;
    }
  }

  return { days, maxCount, totalCols, monthLabels };
}

/** 셀 색: 범위 밖 → 미래 → 첫 기록 → binary/그라데이션 순 */
export function cellFillColor(
  day: GridDay,
  isFirst: boolean,
  opts: { binary: boolean; isDark: boolean; accent: string; maxCount: number },
): string {
  const { binary, isDark, accent, maxCount } = opts;
  const emptyFill = isDark ? "rgb(39, 39, 42)" : "rgb(244, 244, 245)";
  if (day.isOutOfRange) return "transparent";
  if (day.isFuture) return isDark ? "rgb(24, 24, 27)" : "rgb(250, 250, 250)";
  if (isFirst) return accent;
  if (binary) return day.count > 0 ? accent : emptyFill;
  return grassColor(day.count, maxCount, isDark, accent);
}


