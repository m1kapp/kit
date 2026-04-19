type SafeOk<T> = { ok: true; data: T; error: null };
type SafeErr = { ok: false; data: null; error: Error };
type SafeResult<T> = SafeOk<T> | SafeErr;

/**
 * Runs an async function and returns a result object instead of throwing.
 * Useful when you want to handle a specific error differently without a try/catch.
 *
 * @example
 * const { ok: success, data, error } = await safely(() => db.users.find(id));
 * if (!success) return serverError("DB 조회 실패");
 * return ok(data);
 */
export async function safely<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, error: null };
  } catch (e) {
    return {
      ok: false,
      data: null,
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }
}
