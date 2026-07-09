const BASE_STYLE = `
html { height: 100dvh; }
.wm-link { transition: opacity 0.15s; }
.wm-link:hover { opacity: 0.35; }
`;

let styleInjected = false;
export function injectStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = BASE_STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

export function estimateWidth(text: string, fontSize: number): number {
  return [...text].reduce((w, c) => {
    const code = c.charCodeAt(0);
    const isCJK =
      (code >= 0x1100 && code <= 0x11FF) || // Hangul Jamo
      (code >= 0x3000 && code <= 0x9FFF) || // CJK, Kana
      (code >= 0xAC00 && code <= 0xD7AF) || // Hangul Syllables
      (code >= 0xF900 && code <= 0xFAFF) || // CJK Compat
      (code >= 0xFF00 && code <= 0xFFEF);   // Fullwidth
    return w + fontSize * (isCJK ? 1.0 : 0.62);
  }, 0);
}

/**
 * Split text into up to `maxLines` lines that each fit within `maxWidth`.
 * Prefers breaking at whitespace; falls back to character-level breaks.
 */
export function splitLines(text: string, fontSize: number, maxWidth: number, maxLines: number): string[] {
  if (estimateWidth(text, fontSize) <= maxWidth) return [text];

  const lines: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0 && lines.length < maxLines - 1) {
    let cutAt = 0;
    for (let i = 1; i <= remaining.length; i++) {
      if (estimateWidth(remaining.slice(0, i), fontSize) > maxWidth) break;
      cutAt = i;
    }
    if (cutAt === 0) cutAt = 1; // at least one char per line

    // Prefer breaking at whitespace — but only when the text doesn't already fully fit
    if (cutAt < remaining.length) {
      const lastSpace = remaining.slice(0, cutAt + 1).lastIndexOf(" ");
      if (lastSpace > 0) cutAt = lastSpace;
    }

    lines.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }

  if (remaining.length > 0) lines.push(remaining);
  return lines.filter(Boolean);
}

/**
 * Full-screen colored background with repeating animated text watermark pattern.
 *
 * Renders as a single SVG element with a <pattern> — zero extra DOM nodes per tile.
 * Sponsor tiles inside the pattern are clickable and support hover effects.
 */


export function appendUtm(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "m1kapp");
    return u.toString();
  } catch {
    return url;
  }
}
