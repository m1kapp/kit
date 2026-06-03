import { serverError } from "./response";

/**
 * Validate that required environment variables are present and non-empty.
 * Returns them as a typed object; throws a 500 (via `serverError`) listing every
 * missing key — so inside `handler()` it surfaces as a clean error response.
 *
 * @example
 * const { XAI_API_KEY, DATABASE_URL } = requireEnv(["XAI_API_KEY", "DATABASE_URL"]);
 * // → typed: { XAI_API_KEY: string; DATABASE_URL: string }
 */
export function requireEnv<K extends string>(keys: readonly K[]): Record<K, string> {
  const out = {} as Record<K, string>;
  const missing: string[] = [];
  for (const k of keys) {
    const v = process.env[k];
    if (v == null || v === "") missing.push(k);
    else out[k] = v;
  }
  if (missing.length) serverError(`Missing required env: ${missing.join(", ")}`);
  return out;
}
