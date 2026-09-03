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

/* ─────────────────────────────────────────
   한국어 조사
   받침을 보고 을/를 · 이/가 · 은/는 · 으로/로를 고른다.
   nlnn 에서 옮겨 옴 — 한국어 앱마다 다시 짜게 되는 것이라 킷에 둔다.
───────────────────────────────────────── */

/**
 * 낱말 끝에 받침이 있나. 한글은 글자에서 읽고, 영문은 흔히 옮겨 읽는 소리로
 * 짐작한다 — Lucasfilm(루카스필름)은 받침이 있고 Anysphere(애니스피어)는 없다.
 * 끝이 모음이나 r·s·x·h·w·y 면 받침 없음, 나머지 자음이면 받침 있음으로 본다.
 */
function hasFinalConsonant(word: string): boolean {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[0-9]/.test(last)) return /[013678]/.test(last); // 일·삼·육·칠·팔·영 은 받침이 있다
  return /[bcdfgklmnptvz]/i.test(last);
}

/** ㄹ 받침은 "으로" 가 아니라 "로" 를 받는다 — "서울로", "조선으로". */
function endsWithRieul(word: string): boolean {
  const code = word.trim().slice(-1).charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return /l$/i.test(word.trim());
  return (code - 0xac00) % 28 === 8;
}

/**
 * 뒤에 오는 말에 맞는 조사를 고른다.
 *
 *   particle("하이브", "은", "는")   // "는"
 *   particle("서울", "으로", "로")   // "로" (ㄹ 받침 특례)
 */
export function particle(word: string, withFinal: string, withoutFinal: string): string {
  if (withFinal === "으로" && endsWithRieul(word)) return "로";
  return hasFinalConsonant(word) ? withFinal : withoutFinal;
}

/** 낱말에 조사를 붙여 돌려준다. withParticle("Anysphere", "을", "를") → "Anysphere를" */
export const withParticle = (word: string, withFinal: string, withoutFinal: string): string =>
  `${word}${particle(word, withFinal, withoutFinal)}`;

/* ─────────────────────────────────────────
   조/억 금액 표기
   "6.0조 원" · "8,508억 원" · "$190억"
───────────────────────────────────────── */

/** 원화를 조/억으로. 1조 이상은 조(소수 1자리), 천조 이상은 쉼표 정수 조, 그 아래는 억. */
export function formatWon(n: number): string {
  return `${formatWonTight(n)} 원`;
}

/** formatWon 에서 " 원" 을 뗀 꼴. 좁은 칸·문장 속에 쓴다 — "6.0조", "8,508억". */
export function formatWonTight(n: number): string {
  const jo = n / 1e12;
  if (Math.abs(jo) >= 1000) return `${Math.round(jo).toLocaleString("ko-KR")}조`;
  if (Math.abs(jo) >= 1) return `${jo.toFixed(1)}조`;
  return `${Math.round(n / 1e8).toLocaleString("ko-KR")}억`;
}

/** 달러를 억 단위로 — "$190억", "$3.5억". 빼기표는 $ 앞에 둔다("-$49억"). */
export function formatDollarEok(n: number): string {
  const eok = n / 1e8;
  const size = Math.abs(eok);
  const digits =
    size >= 1000 ? Math.round(size).toLocaleString("ko-KR") : size >= 10 ? size.toFixed(0) : size.toFixed(1);
  return `${n < 0 ? "-" : ""}$${digits}억`;
}

/* ─────────────────────────────────────────
   watermarkTint
   액센트색 → 워터마크 배경으로 쓸 어두운 저채도 틴트
───────────────────────────────────────── */

/**
 * 액센트를 그대로 <Watermark color> 에 쓰면 배경이 앱보다 시끄럽다(쨍한 파랑 위
 * 워터마크 글자가 화면을 덮는다). 색조는 남기고 채도·명도를 눌러, nlnn 의
 * 어두운 올리브(#3d4230)처럼 앱이 도드라지는 배경을 만든다.
 *
 *   <Watermark color={watermarkTint("#2563eb")} …>   // 어두운 남색 슬레이트
 */
export function watermarkTint(accentHex: string, { saturation = 0.22, lightness = 0.16 } = {}): string {
  const hex = accentHex.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  // 무채색 액센트는 색조가 없다 — 그냥 어두운 회색이 된다.
  const s = d === 0 ? 0 : saturation;
  const l = lightness;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  const [r2, g2, b2] =
    h < 1 / 6 ? [c, x, 0] : h < 2 / 6 ? [x, c, 0] : h < 3 / 6 ? [0, c, x] : h < 4 / 6 ? [0, x, c] : h < 5 / 6 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r2)}${to(g2)}${to(b2)}`;
}

export {
  toKst, kstMidnight, kstToday, kstNowParts, kstDayOfMonth, isKstToday,
  startOfKstWeek, kstWeekLabel, isoWeekOfStart, kstWeekTitle, kstWeekParam, weeksAgoFromKstWeekParam,
} from "./kst";
export { toChoseong, matchesQuery } from "./korean-search";
