// control chars to strip (keep \t \n \r): 0x00-08, 0x0B, 0x0C, 0x0E-1F
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

/**
 * Best-effort parse of a JSON object/array embedded in noisy text — e.g. an LLM
 * reply wrapped in prose or ```json fences. Strips code fences, slices to the
 * outermost bracket pair, removes trailing commas and control chars. Throws if
 * nothing parses.
 *
 * @example
 * const data = recoverJsonFromText<{ items: string[] }>(llmReply);
 */
export function recoverJsonFromText<T = unknown>(text: string): T {
  const tryParse = (s: string): T | undefined => {
    try {
      return JSON.parse(s) as T;
    } catch {
      return undefined;
    }
  };

  // 1) straight parse
  const direct = tryParse(text.trim());
  if (direct !== undefined) return direct;

  // 2) strip code fences
  let s = text.replace(/```(?:json)?/gi, "").trim();

  // 3) slice to the outermost { } or [ ]
  const starts = [s.indexOf("{"), s.indexOf("[")].filter((i) => i >= 0);
  const first = starts.length ? Math.min(...starts) : -1;
  const last = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (first >= 0 && last > first) s = s.slice(first, last + 1);

  // 4) drop trailing commas + stray control chars, then retry
  s = s.replace(/,\s*([}\]])/g, "$1").replace(CONTROL_CHARS, "");
  const parsed = tryParse(s);
  if (parsed !== undefined) return parsed;

  throw new Error("recoverJsonFromText: no valid JSON found in text");
}
