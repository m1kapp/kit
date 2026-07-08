import { ApiError } from "./errors";
import { parseBody } from "./client";

/**
 * useFetch용 POST fetcher. useFetch는 URL 문자열이 캐시 키이므로, POST 조회는
 * `경로#식별자` 형태로 키를 만들고 요청 시 '#' 뒤를 잘라낸다:
 *
 * @example
 * // 같은 경로에 body만 다른 두 조회 — 키로 캐시가 분리된다
 * useFetch(`/api/playlist#info:${listId}`,   { fetcher: postJson({ listId, infoOnly: true }) })
 * useFetch(`/api/playlist#videos:${listId}`, { fetcher: postJson({ listId }) })
 *
 * invalidateFetch(`/api/playlist#videos:${listId}`)로 개별 무효화 가능.
 */
export function postJson<T>(body?: unknown): (key: string) => Promise<T> {
  return async (key: string) => {
    const url = key.split("#")[0];
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      const parsed = await parseBody(res).catch(() => null);
      throw new ApiError(res.status, res.statusText, parsed, url, "POST");
    }
    return parseBody(res) as Promise<T>;
  };
}
