declare class HttpError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(status: number, body: unknown);
}
/** 200 OK with JSON body */
declare function ok<T>(data: T, status?: number): Response;
/** 201 Created with JSON body */
declare function created<T>(data: T): Response;
/** 204 No Content */
declare function noContent(): Response;
/** 400 Bad Request — throw inside handler() */
declare function badRequest(message?: string, errors?: unknown): never;
/** 401 Unauthorized — throw inside handler() */
declare function unauthorized(message?: string): never;
/** 403 Forbidden — throw inside handler() */
declare function forbidden(message?: string): never;
/** 404 Not Found — throw inside handler() */
declare function notFound(message?: string): never;
/** 409 Conflict — throw inside handler() */
declare function conflict(message?: string): never;
/** 500 Internal Server Error — throw inside handler() */
declare function serverError(message?: string): never;

/**
 * Route context — `any` so the wrapper compiles against all Next.js versions:
 * - Next.js 14: `{ params: Record<string, string | string[]> }`
 * - Next.js 15/16: `{ params: Promise<Record<string, string | string[]>> }`
 *
 * Callers narrow the type themselves inside their handler function.
 */
type RouteContext = any;
/**
 * Wraps a Next.js route handler with automatic error handling.
 * Compatible with Next.js 14, 15, and 16.
 *
 * - HttpError (thrown by unauthorized/notFound/etc.) → proper HTTP response
 * - Any other thrown error → 500
 * - No try/catch needed in your route
 *
 * @example
 * // No params
 * export const GET = handler(async (req) => {
 *   if (!auth) unauthorized();
 *   return ok(await db.findAll());
 * });
 *
 * // Next.js 15/16 — async params
 * export const GET = handler(async (_req, ctx) => {
 *   const { id } = await ctx.params;
 *   return ok(await db.find(id));
 * });
 *
 * // Next.js 14 — sync params
 * export const GET = handler(async (_req, ctx) => {
 *   const { id } = ctx.params;
 *   return ok(await db.find(id));
 * });
 */
declare function handler(fn: (req: Request) => Promise<Response>): (req: Request, ctx?: RouteContext) => Promise<Response>;
declare function handler<P extends Record<string, string | string[]>>(fn: (req: Request, ctx: {
    params: Promise<P>;
}) => Promise<Response>): (req: Request, ctx?: RouteContext) => Promise<Response>;
declare function handler<P extends Record<string, string | string[]>>(fn: (req: Request, ctx: {
    params: P;
}) => Promise<Response>): (req: Request, ctx?: RouteContext) => Promise<Response>;

type SafeOk<T> = {
    ok: true;
    data: T;
    error: null;
};
type SafeErr = {
    ok: false;
    data: null;
    error: Error;
};
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
declare function safely<T>(fn: () => Promise<T>): Promise<SafeResult<T>>;

export { HttpError, badRequest, conflict, created, forbidden, handler, noContent, notFound, ok, safely, serverError, unauthorized };
