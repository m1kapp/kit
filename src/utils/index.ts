/* ─────────────────────────────────────────
   relativeTime
   "방금 전" / "3분 전" / "어제" / "2025. 4. 19."
───────────────────────────────────────── */
export function relativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const secs = Math.floor(diff / 1000);

  if (secs < 60)          return "방금 전";
  if (secs < 3_600)       return `${Math.floor(secs / 60)}분 전`;
  if (secs < 86_400)      return `${Math.floor(secs / 3_600)}시간 전`;
  if (secs < 86_400 * 2)  return "어제";
  if (secs < 86_400 * 7)  return `${Math.floor(secs / 86_400)}일 전`;
  if (secs < 86_400 * 30) return `${Math.floor(secs / (86_400 * 7))}주 전`;

  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─────────────────────────────────────────
   formatNumber
   1_500 → "1.5천" / 15_000 → "1.5만" / 1_000_000 → "100만"
───────────────────────────────────────── */
export function formatNumber(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1).replace(/\.0$/, "")}억`;
  if (abs >= 10_000)      return `${sign}${(abs / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (abs >= 1_000)       return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}천`;
  return n.toLocaleString("ko-KR");
}

/* ─────────────────────────────────────────
   formatPrice
   9900 → "₩9,900"  |  9.99 (USD) → "$9.99"
───────────────────────────────────────── */
export function formatPrice(
  amount: number,
  currency = "KRW",
  locale = "ko-KR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount);
}

/* ─────────────────────────────────────────
   cn — conditional class names with Tailwind conflict resolution
───────────────────────────────────────── */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ─────────────────────────────────────────
   formatDuration
   90_000 → "1분 30초" (short) | "1:30" (clock)
   3_661_000 → "1시간 1분" (short) | "1:01:01" (clock)
───────────────────────────────────────── */
export function formatDuration(
  ms: number,
  opts: { style?: "short" | "clock" } = {},
): string {
  const { style = "short" } = opts;
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (style === "clock") {
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // short (Korean)
  if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  if (m > 0) return s > 0 ? `${m}분 ${s}초` : `${m}분`;
  return `${s}초`;
}

/* ─────────────────────────────────────────
   groupByDay
   리스트를 달력 일자별로 그룹핑 (오늘 / 어제 / "4월 19일 (토)").
   각 그룹은 입력 순서를 유지.
───────────────────────────────────────── */
export interface DayGroup<T> {
  /** YYYY-MM-DD */
  date: string;
  /** 오늘 / 어제 / "M월 D일 (요일)" */
  label: string;
  items: T[];
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Korean day label relative to today: "오늘" / "어제" / "4월 19일 (토)".
 * Shared by `groupByDay` and `MessageList`'s day dividers.
 */
export function formatDayLabel(time: number | string | Date): string {
  const d = new Date(time);
  const key = toDateKey(d);
  if (key === toDateKey(new Date())) return "오늘";
  if (key === toDateKey(new Date(Date.now() - 86_400_000))) return "어제";
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS_KO[d.getDay()]})`;
}

export function groupByDay<T>(
  items: T[],
  getTime: (item: T) => number | string | Date,
): DayGroup<T>[] {
  const order: string[] = [];
  const map = new Map<string, DayGroup<T>>();

  for (const item of items) {
    const time = getTime(item);
    const d = new Date(time);
    const date = toDateKey(d);
    let group = map.get(date);
    if (!group) {
      group = { date, label: formatDayLabel(time), items: [] };
      map.set(date, group);
      order.push(date);
    }
    group.items.push(item);
  }

  return order.map((date) => map.get(date)!);
}

/* ─────────────────────────────────────────
   fillDateSeries
   일별 카운트 시계열의 빈 날짜를 0으로 채움
───────────────────────────────────────── */
export interface DateCount {
  date: string;
  count: number;
}

/**
 * 최근 N일을 0-채움한 연속 시계열로 변환 (오늘 포함, 과거→현재 순).
 * 날짜 키는 "YYYY-MM-DD", 기본 KST — 차트 X축이 끊기지 않게 한다.
 *
 * @example
 * fillDateSeries([{ date: "2026-07-06", count: 3 }], 7)
 * // [{date:"2026-07-01",count:0}, …, {date:"2026-07-06",count:3}, {date:"2026-07-07",count:0}]
 */
export function fillDateSeries(
  daily: DateCount[],
  days: number,
  timeZone = "Asia/Seoul",
): DateCount[] {
  const byDate = new Map(daily.map((d) => [d.date, Number(d.count)]));
  const out: DateCount[] = [];
  const now = Date.now();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  for (let i = days - 1; i >= 0; i--) {
    const date = fmt.format(new Date(now - i * 86_400_000));
    out.push({ date, count: byDate.get(date) ?? 0 });
  }
  return out;
}

/* ─────────────────────────────────────────
   formatKoreanNumber
   56789 → "5만", 123456789 → "1억", 1234 → "1천"
───────────────────────────────────────── */
/**
 * 한국식 수 축약 (내림). 조회수·좋아요 표기용 — 단위는 호출부에서
 * `${formatKoreanNumber(n)}회`처럼 붙인다.
 */
export function formatKoreanNumber(n: number | string): string {
  const count = typeof n === "string" ? parseInt(n, 10) : n;
  if (!Number.isFinite(count)) return "0";
  if (count >= 100_000_000) return `${Math.floor(count / 100_000_000).toLocaleString()}억`;
  if (count >= 10_000) return `${Math.floor(count / 10_000).toLocaleString()}만`;
  if (count >= 1_000) return `${Math.floor(count / 1_000).toLocaleString()}천`;
  return count.toLocaleString();
}

/* ─────────────────────────────────────────
   ISO 8601 duration (유튜브 API 등의 "PT1H2M3S")
───────────────────────────────────────── */
export interface IsoDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

/** "PT1H2M3S" → { hours: 1, minutes: 2, seconds: 3 } */
export function parseIsoDuration(duration: string): IsoDuration {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  return {
    hours: parseInt(match?.[1] ?? "0") || 0,
    minutes: parseInt(match?.[2] ?? "0") || 0,
    seconds: parseInt(match?.[3] ?? "0") || 0,
  };
}

/** "PT1H2M3S" → 3723 (초) */
export function isoDurationToSec(duration: string): number {
  const { hours, minutes, seconds } = parseIsoDuration(duration);
  return hours * 3600 + minutes * 60 + seconds;
}
