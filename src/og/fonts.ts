/** @vercel/og (Satori) fonts 옵션에 넘길 수 있는 폰트 정의 */
export interface OGFont {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: "normal" | "italic";
}

/* ═══════════════════════════════════════
   CDN URLs
═══════════════════════════════════════ */
const PRETENDARD_CDN = "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard";

const PRETENDARD_WEIGHTS = {
  400: "Pretendard-Regular.otf",
  700: "Pretendard-Bold.otf",
  900: "Pretendard-Black.otf",
} as const;

type PretendardWeight = keyof typeof PRETENDARD_WEIGHTS;

/* ═══════════════════════════════════════
   인메모리 캐시 — 같은 프로세스 내 중복 fetch 방지
═══════════════════════════════════════ */
const cache = new Map<string, Promise<ArrayBuffer>>();

function fetchCached(url: string): Promise<ArrayBuffer> {
  const hit = cache.get(url);
  if (hit) return hit;
  const p = fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Font fetch failed: ${r.status} ${url}`);
    return r.arrayBuffer();
  });
  cache.set(url, p);
  return p;
}

/* ═══════════════════════════════════════
   Public API
═══════════════════════════════════════ */

/**
 * Pretendard 폰트를 CDN에서 로드합니다.
 *
 * @example
 * ```ts
 * import { OG, loadPretendard } from "@m1kapp/seo";
 * import { ImageResponse } from "next/og";
 *
 * export async function GET() {
 *   const fonts = await loadPretendard();
 *   return new ImageResponse(<OG type="default" title="Hello" />, {
 *     width: 1200, height: 630, fonts,
 *   });
 * }
 * ```
 *
 * @param weights 로드할 weight 배열 (기본: [700, 900])
 */
export async function loadPretendard(
  weights: PretendardWeight[] = [700, 900],
): Promise<OGFont[]> {
  const fonts = await Promise.all(
    weights.map(async (weight) => {
      const file = PRETENDARD_WEIGHTS[weight];
      const data = await fetchCached(`${PRETENDARD_CDN}/${file}`);
      return { name: "Pretendard", data, weight, style: "normal" as const };
    }),
  );
  return fonts;
}

/**
 * 임의의 URL에서 폰트를 로드합니다.
 *
 * @example
 * ```ts
 * const fonts = await loadFont({
 *   name: "CustomFont",
 *   url: "https://example.com/CustomFont-Bold.otf",
 *   weight: 700,
 * });
 * ```
 */
export async function loadFont(opts: {
  name: string;
  url: string;
  weight?: OGFont["weight"];
  style?: OGFont["style"];
}): Promise<OGFont> {
  const data = await fetchCached(opts.url);
  return {
    name: opts.name,
    data,
    weight: opts.weight ?? 400,
    style: opts.style ?? "normal",
  };
}

/**
 * Google Fonts에서 폰트를 로드합니다.
 * CSS 응답을 파싱해 TTF/OTF URL을 자동 추출합니다.
 *
 * @example
 * ```ts
 * const fonts = await loadGoogleFont("Noto Sans KR", [400, 700]);
 * return new ImageResponse(<OG ... />, { fonts });
 * ```
 */
export async function loadGoogleFont(
  family: string,
  weights: OGFont["weight"][] = [400, 700],
): Promise<OGFont[]> {
  const query = weights.map((w) => `${w}`).join(";");
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${query}&display=swap`;

  const css = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }, // Google Fonts가 woff2 대신 ttf 반환하도록
  }).then((r) => {
    if (!r.ok) throw new Error(`Google Fonts fetch failed: ${r.status}`);
    return r.text();
  });

  // CSS에서 font-face URL 추출
  const urlMatches = [...css.matchAll(/src:\s*url\(([^)]+)\)\s*format\(['"]?(truetype|opentype|woff2?)['"]?\)/g)];
  const weightMatches = [...css.matchAll(/font-weight:\s*(\d+)/g)];

  const results: OGFont[] = [];
  for (let i = 0; i < urlMatches.length; i++) {
    const fontUrl = urlMatches[i][1].replace(/['"]/g, "");
    const weight = (weightMatches[i] ? Number(weightMatches[i][1]) : weights[i] ?? 400) as OGFont["weight"];
    const data = await fetchCached(fontUrl);
    results.push({ name: family, data, weight, style: "normal" });
  }

  if (results.length === 0) throw new Error(`No fonts found for "${family}"`);
  return results;
}
