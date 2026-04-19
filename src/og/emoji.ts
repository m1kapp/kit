/**
 * @vercel/og ImageResponse에서 지원하는 이모지 스타일.
 * ImageResponse 옵션의 `emoji` 필드에 넘기면 됩니다.
 */
export type EmojiStyle = "twemoji" | "openmoji" | "noto" | "fluent" | "fluentFlat" | "blobmoji";

/* ═══════════════════════════════════════
   Twemoji SVG fetcher — raw Satori용
═══════════════════════════════════════ */
const TWEMOJI_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";

const emojiCache = new Map<string, Promise<string>>();

/** 이모지 문자를 Twemoji 코드포인트 문자열로 변환 */
function toCodePoint(emoji: string): string {
  const cps: string[] = [];
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.codePointAt(i)!;
    if (code > 0xffff) i++; // surrogate pair skip
    // VS16 (0xfe0f) 제거 — Twemoji 파일명에는 포함 안 됨
    if (code !== 0xfe0f) cps.push(code.toString(16));
  }
  return cps.join("-");
}

/** Twemoji SVG를 CDN에서 가져옵니다 (인메모리 캐싱) */
async function fetchTwemoji(emoji: string): Promise<string> {
  const cp = toCodePoint(emoji);
  const url = `${TWEMOJI_CDN}/${cp}.svg`;

  const hit = emojiCache.get(url);
  if (hit) return hit;

  const p = fetch(url).then(async (r) => {
    if (!r.ok) return "";
    return r.text();
  });
  emojiCache.set(url, p);
  return p;
}

/**
 * raw Satori의 `loadAdditionalAsset` 콜백을 생성합니다.
 *
 * @example
 * ```ts
 * import satori from "satori";
 * import { createEmojiLoader } from "@m1kapp/seo";
 *
 * const svg = await satori(<OG ... />, {
 *   width: 1200, height: 630,
 *   fonts: [...],
 *   loadAdditionalAsset: createEmojiLoader(),
 * });
 * ```
 */
export function createEmojiLoader() {
  return async (code: string, segment: string): Promise<string | undefined> => {
    if (code === "emoji") {
      const svg = await fetchTwemoji(segment);
      if (!svg) return undefined;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    return undefined;
  };
}
