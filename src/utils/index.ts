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
