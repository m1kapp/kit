/* ─────────────────────────────────────────
   HttpError — internal signal between
   error helpers and handler()
───────────────────────────────────────── */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`HTTP ${status}`);
    this.name = "HttpError";
  }
}

/* ─────────────────────────────────────────
   Success responses — return these
───────────────────────────────────────── */

/** 200 OK with JSON body */
export function ok<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

/** 201 Created with JSON body */
export function created<T>(data: T): Response {
  return Response.json(data, { status: 201 });
}

/** 204 No Content */
export function noContent(): Response {
  return new Response(null, { status: 204 });
}

/* ─────────────────────────────────────────
   Error helpers — these THROW (never return)
   Use inside handler() — gets caught automatically.

   Return type is `never`, so TypeScript narrows
   control flow correctly:

   if (!user) unauthorized();
   // TypeScript knows: user is defined below
───────────────────────────────────────── */

/** 400 Bad Request — throw inside handler() */
export function badRequest(message = "Bad Request", errors?: unknown): never {
  throw new HttpError(400, { error: message, ...(errors ? { errors } : {}) });
}

/** 401 Unauthorized — throw inside handler() */
export function unauthorized(message = "Unauthorized"): never {
  throw new HttpError(401, { error: message });
}

/** 403 Forbidden — throw inside handler() */
export function forbidden(message = "Forbidden"): never {
  throw new HttpError(403, { error: message });
}

/** 404 Not Found — throw inside handler() */
export function notFound(message = "Not Found"): never {
  throw new HttpError(404, { error: message });
}

/** 409 Conflict — throw inside handler() */
export function conflict(message = "Conflict"): never {
  throw new HttpError(409, { error: message });
}

/** 500 Internal Server Error — throw inside handler() */
export function serverError(message = "Internal Server Error"): never {
  throw new HttpError(500, { error: message });
}
