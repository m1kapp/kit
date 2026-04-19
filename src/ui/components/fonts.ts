/**
 * Font presets for @m1kapp/ui.
 * CDN links only — no font files bundled.
 *
 * ## Quick setup (recommended)
 *
 * Add to your `index.html` <head>:
 * ```html
 * <link rel="preconnect" href="https://cdn.jsdelivr.net" />
 * <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
 * ```
 *
 * Add to your global CSS:
 * ```css
 * html {
 *   font-family: "Tossface", "Pretendard Variable", "Pretendard", system-ui, sans-serif;
 * }
 * ```
 *
 * That's it — Tossface handles emojis, Pretendard handles text.
 */

export const fonts = {
  /**
   * Tossface — Toss emoji font (open source, jsDelivr CDN).
   * Renders all emoji with the Toss design style.
   * Add this to get consistent emoji across platforms.
   */
  tossface: 'https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css',

  /**
   * Pretendard — best Korean variable web font (jsDelivr CDN).
   * Recommended for all Korean UI text.
   */
  pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',

  /** Inter — clean Latin sans-serif (Google Fonts) */
  inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
} as const;

export type FontName = keyof typeof fonts;

/**
 * Recommended font-family stacks.
 *
 * @example
 * // In your global CSS:
 * html { font-family: ${fontFamily.default}; }
 *
 * // Or in JS (e.g. main.tsx):
 * document.documentElement.style.fontFamily = fontFamily.default;
 */
export const fontFamily = {
  /**
   * Default recommended stack.
   * Tossface for emoji + Pretendard for Korean/Latin text.
   */
  default: '"Pretendard Variable", "Pretendard", system-ui, -apple-system, sans-serif, "Tossface"',

  /** Pretendard only */
  pretendard: '"Pretendard Variable", "Pretendard", system-ui, sans-serif',

  /** Inter only */
  inter: '"Inter", system-ui, sans-serif',
} as const;
