/**
 * Calendar date as "YYYY-MM-DD" for a given IANA time zone (default UTC).
 * Uses Intl (zero deps), so it's correct across DST and offsets.
 *
 * @example
 * dateInTz(new Date(), "Asia/Seoul")  // "2026-06-04"
 * dateInTz(someEpochMs, "America/New_York")
 */
export function dateInTz(date: Date | number | string = new Date(), timeZone = "UTC"): string {
  const d = date instanceof Date ? date : new Date(date);
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Today's calendar date "YYYY-MM-DD" in KST (Asia/Seoul). */
export function todayKST(date: Date | number | string = new Date()): string {
  return dateInTz(date, "Asia/Seoul");
}
