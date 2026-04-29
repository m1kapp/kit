/**
 * Font presets for @m1kapp/kit.
 * CDN links only — no font files bundled.
 *
 * ## Setup
 *
 * ### Option A: `FontLinks` 컴포넌트 (Next.js App Router 권장)
 *
 * ```tsx
 * // app/layout.tsx
 * import { FontLinks, fontFamily, THEME_SCRIPT } from "@m1kapp/kit";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="ko">
 *       <head>
 *         <FontLinks />
 *         <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
 *       </head>
 *       <body style={{ fontFamily: fontFamily.default }}>
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * ### Option B: 수동 `<link>` (Vite / static HTML)
 *
 * ⚠️ Next.js App Router에서 `<link href={fonts.tossface}>` 처럼
 * 변수를 사용하면 SSR 시 href가 누락됩니다. URL을 직접 하드코딩하세요.
 *
 * ```html
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
 * ```
 *
 * ### Font stack
 *
 * Tossface를 `system-ui` 앞에 배치해야 macOS에서
 * Apple Color Emoji 대신 Tossface가 적용됩니다.
 *
 * ```css
 * html { font-family: "Tossface", "Pretendard Variable", "Pretendard", sans-serif; }
 * ```
 */

export const fonts = {
  /** Tossface — Toss emoji font (open source, jsDelivr CDN). */
  tossface: 'https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css',

  /** Pretendard — Korean variable web font (jsDelivr CDN). */
  pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',

  /** Inter — clean Latin sans-serif (Google Fonts) */
  inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
} as const;

export type FontName = keyof typeof fonts;

/**
 * Recommended font-family stacks.
 *
 * Tossface를 맨 앞에 배치합니다.
 * unicode-range 덕분에 이모지만 Tossface로, 나머지는 Pretendard로 렌더됩니다.
 * system-ui를 포함하면 macOS Apple Color Emoji가 먼저 적용될 수 있어 제외합니다.
 */
export const fontFamily = {
  /** Tossface(emoji) + Pretendard(text). */
  default: '"Tossface", "Pretendard Variable", "Pretendard", sans-serif',

  /** Pretendard only (no Tossface emoji) */
  pretendard: '"Pretendard Variable", "Pretendard", system-ui, sans-serif',

  /** Inter only */
  inter: '"Inter", system-ui, sans-serif',
} as const;

/**
 * `<link>` 태그를 렌더하는 컴포넌트.
 *
 * Next.js App Router에서 `<link href={변수}>`를 쓰면
 * SSR 시 href가 누락되는 버그가 있어, URL을 리터럴로 하드코딩합니다.
 *
 * ```tsx
 * <head>
 *   <FontLinks />
 * </head>
 * ```
 */
export function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
      />
    </>
  );
}
