"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "./errors";
import { parseBody } from "./client";
import { trackFetchStart, trackFetchEnd } from "./activity";

/* ─────────────────────────────────────────
   Module-level cache & dedup store
───────────────────────────────────────── */
interface CacheEntry<T> {
  data: T;
  ts: number;
}

const CACHE_MAX = 500;
const _cache = new Map<string, CacheEntry<unknown>>();
const _inflight = new Map<string, Promise<unknown>>();
// Mounted useFetch hooks by URL — so invalidateFetch can force live refetches
const _subscribers = new Map<string, Set<() => void>>();

/** Manually invalidate cache entries. Pass a URL to clear one, or nothing to clear all. */
export function clearFetchCache(url?: string) {
  if (url) _cache.delete(url);
  else _cache.clear();
}

/**
 * Invalidate cached data AND force every mounted useFetch hook on that URL to
 * refetch immediately (stale-while-revalidate: current data stays visible
 * while the refetch runs). Pass nothing to invalidate everything.
 *
 * The react-query `invalidateQueries` equivalent:
 * `await fetch("/api/weekly", { method: "POST" }); invalidateFetch("/api/weekly");`
 */
export function invalidateFetch(url?: string) {
  if (url) {
    _cache.delete(url);
    _subscribers.get(url)?.forEach((reload) => reload());
  } else {
    _cache.clear();
    for (const set of _subscribers.values()) set.forEach((reload) => reload());
  }
}

function cacheSet(url: string, entry: CacheEntry<unknown>) {
  if (_cache.size >= CACHE_MAX) {
    // Map preserves insertion order — delete the oldest entry
    _cache.delete(_cache.keys().next().value!);
  }
  _cache.set(url, entry);
}

/* ─────────────────────────────────────────
   Default fetcher
───────────────────────────────────────── */
async function defaultFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await parseBody(res).catch(() => null);
    throw new ApiError(res.status, res.statusText, body, url, "GET");
  }
  return parseBody(res) as Promise<T>;
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
export type FetchStatus = "idle" | "loading" | "success" | "error";

export interface UseFetchOptions<T> {
  /** Skip fetching when false (default: true) */
  enabled?: boolean;
  /**
   * Freshness window in ms (default: 0 — always stale).
   *
   * Results are ALWAYS cached and shown instantly on the next mount
   * (stale-while-revalidate). `staleTime` only controls whether a
   * background revalidation fires: within the window the cache is
   * trusted as-is; past it, the cached data is shown immediately and
   * refreshed in the background (`revalidating: true`).
   */
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
  /**
   * Lifecycle status:
   * - `"idle"` — url is null/undefined or `enabled: false`
   * - `"loading"` — fetch in progress with NO cached data to show (cold load)
   * - `"success"` — data shown (possibly stale — see `revalidating`)
   * - `"error"` — last fetch failed and no cached data was available
   */
  status: FetchStatus;
  /**
   * True while a background revalidation is in flight — cached data is
   * already displayed. Use for subtle indicators (top bar, spinner icon),
   * NOT for replacing content.
   */
  revalidating: boolean;
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

  // Stale-while-revalidate: any cached entry (fresh OR stale) seeds the
  // initial render so remounts never flash a loading state.
  const [data, setData] = useState<T | undefined>(() => {
    if (!url) return undefined;
    return _cache.get(url)?.data as T | undefined;
  });
  const [status, setStatus] = useState<FetchStatus>(() => {
    if (!url || !enabled) return "idle";
    return _cache.has(url) ? "success" : "loading";
  });
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  fetcherRef.current = fetcher;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const load = useCallback(
    async (force = false) => {
      if (!url || !enabled) {
        // Only update if not already idle — avoids redundant renders
        setStatus((s) => s === "idle" ? s : "idle");
        return;
      }

      const hit = _cache.get(url);
      if (hit) {
        // Show cached data immediately — even when stale (SWR)
        setData(hit.data as T);
        setStatus("success");
        const fresh = staleTime > 0 && Date.now() - hit.ts < staleTime;
        if (fresh && !force) return;
        setRevalidating(true);
      } else {
        // Cold load — nothing to show yet
        setStatus("loading");
      }
      setError(undefined);

      try {
        // Deduplicate in-flight requests for the same URL
        let promise = _inflight.get(url) as Promise<T> | undefined;
        if (!promise) {
          trackFetchStart();
          promise = withRetry(() => fetcherRef.current(url), retry, retryDelay);
          _inflight.set(url, promise);
          promise.finally(() => {
            _inflight.delete(url);
            trackFetchEnd();
          });
        }

        const result = await promise;
        if (!mounted.current) return;

        cacheSet(url, { data: result, ts: Date.now() });
        setData(result);
        setStatus("success");
        setRevalidating(false);
        onSuccessRef.current?.(result);
      } catch (e) {
        if (!mounted.current) return;
        const err = e as Error;
        setError(err);
        setRevalidating(false);
        // Background revalidation failure keeps showing cached data;
        // only a cold load with nothing to show surfaces "error"
        setStatus(hit ? "success" : "error");
        onErrorRef.current?.(err);
      }
    },
    // fetcher excluded — stored in fetcherRef to avoid re-fetching when caller
    // passes an inline function reference that changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, enabled, staleTime, retry, retryDelay]
  );

  const refetch = useCallback(() => load(true), [load]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  // Register with the invalidation registry so invalidateFetch(url) can
  // force this hook to refetch while mounted
  useEffect(() => {
    if (!url) return;
    const reload = () => load(true);
    let set = _subscribers.get(url);
    if (!set) {
      set = new Set();
      _subscribers.set(url, set);
    }
    set.add(reload);
    return () => {
      set.delete(reload);
      if (set.size === 0) _subscribers.delete(url);
    };
  }, [url, load]);

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

  return { data, loading: status === "loading", error, status, revalidating, refetch };
}
