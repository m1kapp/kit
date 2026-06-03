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
