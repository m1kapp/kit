import { ApiError } from "./errors";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface ApiClientOptions {
  /** Default headers merged into every request */
  headers?: Record<string, string>;
  /** Called before every request — mutate or replace the Request */
  onRequest?: (req: Request) => Request | void;
  /** Called on every non-2xx response — includes url and method for debugging */
  onError?: (err: ApiError) => void;
}

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Override default Content-Type (e.g. for FormData uploads) */
  contentType?: string | null;
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
export async function parseBody(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/* ─────────────────────────────────────────
   createApiClient
───────────────────────────────────────── */
export function createApiClient(baseUrl: string, defaults: ApiClientOptions = {}) {
  const base = baseUrl.replace(/\/$/, "");

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    opts: RequestOptions = {}
  ): Promise<T> {
    const url = path.startsWith("http") ? path : `${base}/${path.replace(/^\//, "")}`;

    const headers: Record<string, string> = { ...defaults.headers, ...opts.headers };

    // Only set Content-Type automatically for methods that have a body
    if (body !== undefined && opts.contentType !== null) {
      headers["Content-Type"] = opts.contentType ?? "application/json";
    }

    const init: RequestInit = { method, headers, signal: opts.signal };

    if (body !== undefined) {
      init.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    let req = new Request(url, init);
    if (defaults.onRequest) req = defaults.onRequest(req) ?? req;

    const res = await fetch(req);

    if (!res.ok) {
      const errBody = await parseBody(res).catch(() => null);
      const err = new ApiError(res.status, res.statusText, errBody, url, method);
      defaults.onError?.(err);
      throw err;
    }

    // 204 No Content
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    return parseBody(res) as Promise<T>;
  }

  return {
    get:    <T>(path: string, opts?: RequestOptions) =>
      request<T>("GET", path, undefined, opts),
    post:   <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>("POST", path, body, opts),
    put:    <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>("PUT", path, body, opts),
    patch:  <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>("PATCH", path, body, opts),
    delete: <T>(path: string, opts?: RequestOptions) =>
      request<T>("DELETE", path, undefined, opts),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
