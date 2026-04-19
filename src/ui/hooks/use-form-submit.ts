import { useState, useCallback, useRef } from "react";

export interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

/**
 * Submit function type:
 * - When V is `void` (fn takes no arguments) → `submit()` needs no args
 * - Otherwise → `submit(vars: V)` requires the arg
 */
export type SubmitFn<V> = V extends void ? () => Promise<void> : (vars: V) => Promise<void>;

export interface UseFormSubmitResult<T, V> {
  submit: SubmitFn<V>;
  loading: boolean;
  error: Error | null;
  data: T | undefined;
  reset: () => void;
}

/**
 * Wraps an async submit function with loading / error / data state.
 * Eliminates the try/catch/finally + setState boilerplate from every form.
 *
 * @example
 * // With args
 * const { submit, loading, error } = useFormSubmit(async (url: string) => {
 *   return api.post<Site>("/api/sites", { url });
 * }, {
 *   onSuccess: (site) => router.push(`/${site.slug}`),
 * });
 * <button onClick={() => submit(inputValue)}>등록</button>
 *
 * @example
 * // No args (fire-and-forget style)
 * const { submit: save, loading } = useFormSubmit(
 *   () => api.put("/api/sites/settings", config),
 *   { onSuccess: () => setSaved(true) }
 * );
 * <button onClick={save}>저장</button>
 */
export function useFormSubmit<T, V = void>(
  fn: (vars: V) => Promise<T>,
  options: UseFormSubmitOptions<T> = {}
): UseFormSubmitResult<T, V> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);

  // Keep fn/callbacks in refs so submit() identity stays stable
  const fnRef = useRef(fn);
  const optionsRef = useRef(options);
  fnRef.current = fn;
  optionsRef.current = options;

  const submit = useCallback(async (vars?: V) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(vars as V);
      setData(result);
      optionsRef.current.onSuccess?.(result);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      optionsRef.current.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setData(undefined);
  }, []);

  return { submit: submit as SubmitFn<V>, loading, error, data, reset };
}
