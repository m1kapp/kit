import { HttpError } from "./response";

/**
 * Route context — `any` so the wrapper compiles against all Next.js versions:
 * - Next.js 14: `{ params: Record<string, string | string[]> }`
 * - Next.js 15/16: `{ params: Promise<Record<string, string | string[]>> }`
 *
 * Callers narrow the type themselves inside their handler function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteContext = any;

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

// Overload 1: no ctx needed
export function handler(
  fn: (req: Request) => Promise<Response>
): (req: Request, ctx?: RouteContext) => Promise<Response>;

// Overload 2: Next.js 15/16 — async params
export function handler<P extends Record<string, string | string[]>>(
  fn: (req: Request, ctx: { params: Promise<P> }) => Promise<Response>
): (req: Request, ctx?: RouteContext) => Promise<Response>;

// Overload 3: Next.js 14 — sync params
export function handler<P extends Record<string, string | string[]>>(
  fn: (req: Request, ctx: { params: P }) => Promise<Response>
): (req: Request, ctx?: RouteContext) => Promise<Response>;

// Implementation
export function handler(
  fn: (req: Request, ctx?: RouteContext) => Promise<Response>
): (req: Request, ctx?: RouteContext) => Promise<Response> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        return Response.json(e.body, { status: e.status });
      }
      console.error("[handler] Unhandled error:", e);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
