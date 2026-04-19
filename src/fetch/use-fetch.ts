import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "./errors";

/* ─────────────────────────────────────────
   Module-level cache & dedup store
───────────────────────────────────────── */
interface CacheEntry<T> {
  data: T;
  ts: number;
}

const _cache = new Map<string, CacheEntry<unknown>>();
const _inflight = new Map<string, Promise<unknown>>();

/** Manually invalidate cache entries. Pass a URL to clear one, or nothing to clear all. */
export function clearFetchCache(url?: string) {
  if (url) _cache.delete(url);
  else _cache.clear();
}

/* ─────────────────────────────────────────
   Default fetcher
───────────────────────────────────────── */
async function defaultFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, body);
  }
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as unknown as Promise<T>;
}

/* ─────────────────────────────────────────
   Retry helper
───────────────────────────────────────── */
async function withRetry<T>(fn: () => Promise<T>, retries: number, baseDelay: number): Promise<T> {
  let lastErr!: Error;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e as Error;
      // Don't retry on HTTP errors — only network-level failures
      if (e instanceof ApiError) throw e;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, baseDelay * 2 ** i));
      }
    }
  }
  throw lastErr;
}

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface UseFetchOptions<T> {
  /** Skip fetching when false (default: true) */
  enabled?: boolean;
  /** Cache duration in ms. 0 = no cache (default: 0) */
  staleTime?: number;
  /** Number of retries on network error (default: 2) */
  retry?: number;
  /** Base delay between retries in ms — doubles each attempt (default: 1000) */
  retryDelay?: number;
  /** Re-fetch when window regains focus (default: true) */
  revalidateOnFocus?: boolean;
  /** Custom fetcher — defaults to fetch() with JSON/text auto-parse */
  fetcher?: (url: string) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export interface UseFetchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  /** Manually trigger a refetch (ignores cache) */
  refetch: () => void;
}

/* ─────────────────────────────────────────
   useFetch
───────────────────────────────────────── */
export function useFetch<T>(
  url: string | null | undefined,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const {
    enabled = true,
    staleTime = 0,
    retry = 2,
    retryDelay = 1000,
    revalidateOnFocus = true,
    fetcher = defaultFetcher<T>,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(() => {
    if (!url || staleTime === 0) return undefined;
    const hit = _cache.get(url);
    if (hit && Date.now() - hit.ts < staleTime) return hit.data as T;
    return undefined;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!url || !enabled) return false;
    if (staleTime > 0) {
      const hit = _cache.get(url);
      if (hit && Date.now() - hit.ts < staleTime) return false;
    }
    return true;
  });
  const [error, setError] = useState<Error | undefined>(undefined);
  const mounted = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const load = useCallback(
    async (force = false) => {
      if (!url || !enabled) return;

      if (!force && staleTime > 0) {
        const hit = _cache.get(url);
        if (hit && Date.now() - hit.ts < staleTime) {
          setData(hit.data as T);
          return;
        }
      }

      setLoading(true);
      setError(undefined);

      try {
        // Deduplicate in-flight requests for the same URL
        let promise = _inflight.get(url) as Promise<T> | undefined;
        if (!promise) {
          promise = withRetry(() => fetcher(url), retry, retryDelay);
          _inflight.set(url, promise);
          promise.finally(() => _inflight.delete(url));
        }

        const result = await promise;
        if (!mounted.current) return;

        _cache.set(url, { data: result, ts: Date.now() });
        setData(result);
        onSuccessRef.current?.(result);
      } catch (e) {
        if (!mounted.current) return;
        const err = e as Error;
        setError(err);
        onErrorRef.current?.(err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, enabled, staleTime, retry, retryDelay, fetcher]
  );

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  useEffect(() => {
    if (!revalidateOnFocus) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [load, revalidateOnFocus]);

  return { data, loading, error, refetch: () => load(true) };
}
