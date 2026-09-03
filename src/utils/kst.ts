/* ─────────────────────────────────────────
   KST 달력 유틸
   프로덕션 서버는 UTC 다. 로컬 시간으로 날짜·주차를 계산하면 한국 사용자 기준
   경계가 9시간 밀리고(월요일 오전이 아직 지난 주로 잡힌다), 서버가 그린 HTML 과
   기기가 그린 화면이 갈려 하이드레이션도 깨진다. Vercel 은 TZ 환경변수를
   예약어로 막아 두므로 호스팅에 기대지 않고 여기서 맞춘다.
   한국은 서머타임이 없어 UTC+9 고정이라 오프셋 산술로 정확하다.

   ytcc·mysheet·claude-rank·web 이 각자 재구현하던 것을 한 곳으로 모았다.
───────────────────────────────────────── */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const KST_WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

/** epoch → 한국 시각의 달력 부분을 UTC 게터(getUTCFullYear 등)로 읽을 수 있는 Date */
export function toKst(ms: number = Date.now()): Date {
  return new Date(ms + KST_OFFSET_MS);
}

/** 그 시각이 속한 한국 날짜의 00:00 epoch */
export function kstMidnight(ms: number = Date.now()): number {
  const kst = toKst(ms);
  return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - KST_OFFSET_MS;
}

/** 한국 기준 오늘 날짜 "2026-09-03" */
export function kstToday(ms: number = Date.now()): string {
  const kst = toKst(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}`;
}

/** 한국 시각 파츠 — { date: "2026-09-03", weekday: "수", hhmm: "14:05" } */
export function kstNowParts(ms: number = Date.now()): { date: string; weekday: string; hhmm: string } {
  const kst = toKst(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: kstToday(ms),
    weekday: KST_WEEKDAY[kst.getUTCDay()],
    hhmm: `${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`,
  };
}

/** epoch → 한국 기준 '일' 숫자 (날짜 스트립용) */
export function kstDayOfMonth(ms: number): number {
  return toKst(ms).getUTCDate();
}

/** 그 시각이 한국 기준 오늘인가 */
export function isKstToday(ms: number, now: number = Date.now()): boolean {
  return kstMidnight(ms) === kstMidnight(now);
}

/** 이번주(월~일, 한국 달력) 시작 epoch — 이번주 월요일 00:00. weeksAgo=1 이면 지난주 */
export function startOfKstWeek(weeksAgo = 0, now: number = Date.now()): number {
  const kst = toKst(now);
  const mondayOffset = (kst.getUTCDay() + 6) % 7; // 월=0 ~ 일=6
  return kstMidnight(now) - (mondayOffset + weeksAgo * 7) * DAY_MS;
}

/** weeksAgo → "7.6(월) ~ 7.12(일)" 주차 라벨 — 클라이언트·서버 공용 */
export function kstWeekLabel(weeksAgo = 0, now: number = Date.now()): string {
  const start = startOfKstWeek(weeksAgo, now);
  const s = toKst(start);
  const e = toKst(start + 6 * DAY_MS);
  return `${s.getUTCMonth() + 1}.${s.getUTCDate()}(${KST_WEEKDAY[s.getUTCDay()]}) ~ ${e.getUTCMonth() + 1}.${e.getUTCDate()}(${KST_WEEKDAY[e.getUTCDay()]})`;
}

/** 그 해 첫 ISO 주의 월요일 00:00(한국 기준) epoch */
function firstMondayOfIsoYear(year: number): number {
  const jan4 = Date.UTC(year, 0, 4) - KST_OFFSET_MS; // 1월 4일은 항상 첫 ISO 주에 든다
  return jan4 - ((toKst(jan4).getUTCDay() + 6) % 7) * DAY_MS;
}

/** 그 주 월요일 시작 epoch → ISO 8601 { year, week }. 목요일이 속한 해가 ISO 연도 */
export function isoWeekOfStart(start: number): { year: number; week: number } {
  const year = toKst(start + 3 * DAY_MS).getUTCFullYear();
  const week = Math.round((start - firstMondayOfIsoYear(year)) / WEEK_MS) + 1;
  return { year, week };
}

/** weeksAgo → "2026년 28주차" (ISO 8601 주번호) */
export function kstWeekTitle(weeksAgo = 0, now: number = Date.now()): string {
  const { year, week } = isoWeekOfStart(startOfKstWeek(weeksAgo, now));
  return `${year}년 ${week}주차`;
}

/** weeksAgo → URL 용 주차 키 "2026-28" */
export function kstWeekParam(weeksAgo = 0, now: number = Date.now()): string {
  const { year, week } = isoWeekOfStart(startOfKstWeek(weeksAgo, now));
  return `${year}-${String(week).padStart(2, "0")}`;
}

/** "2026-28" 주차 키 → weeksAgo. 형식이 안 맞으면 null */
export function weeksAgoFromKstWeekParam(param: string | null | undefined, now: number = Date.now()): number | null {
  const m = param?.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  const [year, week] = [Number(m[1]), Number(m[2])];
  const targetMonday = firstMondayOfIsoYear(year) + (week - 1) * WEEK_MS;
  return Math.round((startOfKstWeek(0, now) - targetMonday) / WEEK_MS);
}
