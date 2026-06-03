/* ─────────────────────────────────────────
   withRetry — generic async retry
───────────────────────────────────────── */
export interface RetryOptions {
  /** Extra attempts after the first (default 2 → up to 3 total) */
  retries?: number;
  /** Base backoff in ms (default 200) */
  delayMs?: number;
  /** Backoff multiplier per attempt (default 2) */
  factor?: number;
  /** Retry only when this returns true for the thrown error (default: always) */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Retry an async function with exponential backoff. Handy for serverless DB
 * cold starts, flaky upstreams, etc.
 *
 * @example
 * const rows = await withRetry(() => db.query.users.findMany(), {
 *   shouldRetry: (e) => String(e).includes("fetch failed"),
 * });
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, delayMs = 200, factor = 2, shouldRetry } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt === retries || (shouldRetry && !shouldRetry(e, attempt))) throw e;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(factor, attempt)));
    }
  }
  throw lastErr;
}

/* ─────────────────────────────────────────
   fetchWithRetry — fetch + timeout + retry
───────────────────────────────────────── */
class RetryableStatus extends Error {
  constructor(public response: Response) {
    super(`HTTP ${response.status}`);
  }
}

function isNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  return e.name === "AbortError" || /fetch failed|network|ECONN|ETIMEDOUT|EAI_AGAIN/i.test(e.message);
}

export interface FetchRetryOptions extends RequestInit {
  /** Extra attempts after the first (default 2) */
  retries?: number;
  /** Per-attempt timeout in ms (default 10000) */
  timeoutMs?: number;
  /** Base backoff in ms (default 300) */
  retryDelayMs?: number;
  /** Status codes that trigger a retry (default 429, 500, 502, 503, 504) */
  retryStatuses?: number[];
}

/**
 * `fetch` with a per-attempt timeout and automatic retry on network errors and
 * retryable status codes (429/5xx). Returns the last Response even if retries
 * are exhausted, so you can still inspect a final 429/503.
 *
 * @example
 * const res = await fetchWithRetry("https://api.example.com/x", {
 *   headers: { authorization: `Bearer ${key}` }, retries: 3, timeoutMs: 8000,
 * });
 */
export async function fetchWithRetry(url: string | URL, opts: FetchRetryOptions = {}): Promise<Response> {
  const {
    retries = 2,
    timeoutMs = 10_000,
    retryDelayMs = 300,
    retryStatuses = [429, 500, 502, 503, 504],
    ...init
  } = opts;

  try {
    return await withRetry(
      async () => {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), timeoutMs);
        try {
          const res = await fetch(url, { ...init, signal: init.signal ?? ac.signal });
          if (retryStatuses.includes(res.status)) throw new RetryableStatus(res);
          return res;
        } finally {
          clearTimeout(timer);
        }
      },
      {
        retries,
        delayMs: retryDelayMs,
        shouldRetry: (e) => e instanceof RetryableStatus || isNetworkError(e),
      },
    );
  } catch (e) {
    if (e instanceof RetryableStatus) return e.response; // exhausted → hand back the last response
    throw e;
  }
}

/* ─────────────────────────────────────────
   scrapeOg — Open Graph / meta scraper
───────────────────────────────────────── */
function decodeEntities(s?: string): string | undefined {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

export interface OgData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  /** The URL that was actually fetched */
  url: string;
}

/**
 * Fetch a URL and extract Open Graph metadata (og:title/description/image, with
 * twitter:* and plain-tag fallbacks). Resolves relative image URLs. Zero deps —
 * lightweight regex parse, not a full DOM.
 *
 * @example
 * const og = await scrapeOg("example.com");
 * // { title, description, image, siteName, url }
 */
export async function scrapeOg(target: string, opts: { timeoutMs?: number } = {}): Promise<OgData> {
  const url = /^https?:\/\//i.test(target) ? target : `https://${target}`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.timeoutMs ?? 8000);
  let html = "";
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; m1kapp-kit/scrapeOg)" },
    });
    html = await res.text();
  } finally {
    clearTimeout(timer);
  }

  const meta = (key: string): string | undefined => {
    const a = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
    const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i");
    return (html.match(a)?.[1] ?? html.match(b)?.[1]) || undefined;
  };

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  let image = meta("og:image") ?? meta("twitter:image");
  if (image && !/^https?:\/\//i.test(image)) {
    try {
      image = new URL(image, url).href;
    } catch {
      /* leave as-is */
    }
  }

  return {
    title: decodeEntities(meta("og:title") ?? meta("twitter:title") ?? titleTag),
    description: decodeEntities(meta("og:description") ?? meta("twitter:description") ?? meta("description")),
    image,
    siteName: decodeEntities(meta("og:site_name")),
    url,
  };
}
