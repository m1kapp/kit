import { useState, useCallback, useRef } from "react";

export interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export interface UseFormSubmitResult<T, V> {
  submit: (vars: V) => Promise<void>;
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
 * const { submit, loading, error } = useFormSubmit(async (url: string) => {
 *   return api.post<Site>("/api/sites", { url });
 * }, {
 *   onSuccess: () => router.push("/dashboard"),
 * });
 *
 * <form onSubmit={e => { e.preventDefault(); submit(input); }}>
 *   <Button loading={loading}>등록</Button>
 *   {error && <p>{error.message}</p>}
 * </form>
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

  const submit = useCallback(async (vars: V) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(vars);
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

  return { submit, loading, error, data, reset };
}
