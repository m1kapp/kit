const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encode a non-negative integer id into a short base62 slug. `offset` lets you
 * push tiny ids past short/ugly slugs (e.g. offset 1000 → first slug is "g8").
 *
 * @example
 * idToSlug(42)          // "G"
 * idToSlug(1, 1000)     // "g9"   (decode with the same offset)
 */
export function idToSlug(id: number, offset = 0): string {
  let n = id + offset;
  if (!Number.isInteger(n) || n < 0) throw new Error("idToSlug: id must be a non-negative integer");
  if (n === 0) return ALPHABET[0];
  let s = "";
  while (n > 0) {
    s = ALPHABET[n % 62] + s;
    n = Math.floor(n / 62);
  }
  return s;
}

/** Inverse of `idToSlug` (use the same `offset`). */
export function slugToId(slug: string, offset = 0): number {
  let n = 0;
  for (const ch of slug) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) throw new Error(`slugToId: invalid character '${ch}'`);
    n = n * 62 + i;
  }
  return n - offset;
}

/**
 * Resolve the app host from env (default key `NEXT_PUBLIC_HOST`) with a fallback.
 * Useful for building absolute URLs in API routes / OG images.
 *
 * @example
 * const base = `https://${appHost()}`;          // NEXT_PUBLIC_HOST or localhost:3000
 * const base = `https://${appHost("m1k.app")}`; // custom fallback
 */
export function appHost(fallback = "localhost:3000", envKey = "NEXT_PUBLIC_HOST"): string {
  return process.env[envKey] || fallback;
}
