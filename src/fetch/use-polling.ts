import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface UsePollingOptions<T> {
  /** Polling interval in ms (default: 5000) */
  interval?: number;
  /** Start polling immediately (default: true) */
  enabled?: boolean;
  /** Pause polling when the tab is hidden (default: true) */
  pauseOnHidden?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export interface UsePollingResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  /** Whether polling is currently active */
  isRunning: boolean;
  stop: () => void;
  start: () => void;
}

/* ─────────────────────────────────────────
   usePolling
───────────────────────────────────────── */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions<T> = {}
): UsePollingResult<T> {
  const {
    interval = 5000,
    enabled = true,
    pauseOnHidden = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [active, setActive] = useState(enabled);

  const mounted = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  fetcherRef.current = fetcher;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const run = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      if (!mounted.current) return;
      setData(result);
      setError(undefined);
      onSuccessRef.current?.(result);
    } catch (e) {
      if (!mounted.current) return;
      const err = e as Error;
      setError(err);
      onErrorRef.current?.(err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    run();
    timerRef.current = setInterval(run, interval);
  }, [run, stopTimer, interval]);

  useEffect(() => {
    if (!active) { stopTimer(); return; }
    startTimer();
    return stopTimer;
  }, [active, startTimer, stopTimer]);

  useEffect(() => {
    if (!pauseOnHidden) return;
    const onVisibility = () => {
      if (!active) return;
      if (document.visibilityState === "hidden") {
        stopTimer();
      } else {
        startTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active, pauseOnHidden, startTimer, stopTimer]);

  return {
    data,
    loading,
    error,
    isRunning: active,
    stop:  () => setActive(false),
    start: () => setActive(true),
  };
}
