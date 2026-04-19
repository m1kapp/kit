export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly url?: string,
    public readonly method?: string,
  ) {
    super(`${status} ${statusText}${url ? ` [${method ?? "GET"} ${url}]` : ""}`);
    this.name = "ApiError";
  }
}
