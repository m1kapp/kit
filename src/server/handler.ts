import { HttpError } from "./response";

type NextRequest = Request;
type RouteContext = { params?: Record<string, string | string[]> };

/**
 * Wraps a Next.js route handler with automatic error handling.
 *
 * - HttpError (thrown by unauthorized/notFound/etc.) → proper HTTP response
 * - Any other thrown error → 500
 * - No try/catch needed in your route
 *
 * @example
 * export const GET = handler(async (req) => {
 *   const user = await currentUser();
 *   if (!user) unauthorized();          // throws → 401
 *
 *   const site = await db.sites.find(id);
 *   if (!site) notFound("사이트 없음"); // throws → 404
 *
 *   return ok(site);
 * });
 */
export function handler(
  fn: (req: NextRequest, ctx?: RouteContext) => Promise<Response>
): (req: NextRequest, ctx?: RouteContext) => Promise<Response> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        return Response.json(e.body, { status: e.status });
      }
      // Unexpected error — log server-side, return generic 500
      console.error("[handler] Unhandled error:", e);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
