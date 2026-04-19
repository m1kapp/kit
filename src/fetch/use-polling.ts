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
  /** Immediately trigger a fetch without waiting for the next interval */
  refetch: () => void;
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
  const intervalRef = useRef(interval);
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  intervalRef.current = interval;
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
    // Read interval from ref so changing `interval` prop doesn't
    // recreate startTimer → avoids triggering an immediate refetch
    timerRef.current = setInterval(run, intervalRef.current);
  }, [run, stopTimer]);

  // Separate effect: run immediately when polling becomes active,
  // then hand off to the interval set by startTimer
  useEffect(() => {
    if (!active) { stopTimer(); return; }
    run();
    startTimer();
    return stopTimer;
  }, [active, run, startTimer, stopTimer]);

  // When interval changes while active, restart the timer without an extra run()
  useEffect(() => {
    if (!active) return;
    stopTimer();
    timerRef.current = setInterval(run, intervalRef.current);
    return stopTimer;
  // run/stopTimer excluded — stable useCallback([]) refs that never change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  useEffect(() => {
    if (!pauseOnHidden) return;
    const onVisibility = () => {
      if (!active) return;
      if (document.visibilityState === "hidden") {
        stopTimer();
      } else {
        run();
        startTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active, pauseOnHidden, run, startTimer, stopTimer]);

  return {
    data,
    loading,
    error,
    isRunning: active,
    stop:    () => setActive(false),
    start:   () => setActive(true),
    refetch: run,
  };
}
