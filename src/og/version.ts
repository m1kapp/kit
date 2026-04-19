/**
 * OG 이미지 URL의 캐시를 즉시 무효화할 버전 키를 반환합니다.
 *
 * Cache-Control로 CDN에 캐싱된 OG 이미지를 강제 갱신하고 싶을 때
 * URL의 `v` 파라미터에 이 값을 넣으세요.
 *
 * @example
 * ```ts
 * import { getOGVersion } from "@m1kapp/seo";
 *
 * // OG 갱신 버튼 핸들러
 * const freshUrl = `/og?title=${title}&v=${getOGVersion()}`;
 * // → /og?title=...&v=20260415152347
 * ```
 */
export function getOGVersion(): string {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${mo}${d}${h}${mi}${s}`;
}
