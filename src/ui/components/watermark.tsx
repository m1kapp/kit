import { type ReactNode, useId } from "react";

export interface WatermarkSponsor {
  /** Service name displayed in the background as clickable text */
  name: string;
  /** URL to navigate to when the sponsor text is clicked */
  url: string;
}

export interface WatermarkProps {
  children: ReactNode;
  /** Background fill color. Accepts any CSS color value. Default: "#0f172a" */
  color?: string;
  /**
   * Repeating watermark text shown across the background.
   * Default: "m1k"
   */
  text?: string;
  /** Max width of the center content area in px. Default: 430 */
  maxWidth?: number;
  /**
   * 1k milestone sponsor slot.
   * The sponsor's name is interleaved with the watermark text across the
   * background. Sponsor tiles are clickable and open the sponsor URL.
   *
   * Font size auto-scales based on text length (14-28px).
   *
   * @example
   * <Watermark
   *   color={colors.blue}
   *   sponsor={{ name: "@m1kapp/ui", url: "https://github.com/m1kapp/ui" }}
   * >
   *   <AppShell>...</AppShell>
   * </Watermark>
   */
  sponsor?: WatermarkSponsor;
  /**
   * Background drift animation speed in seconds per cycle.
   * Set to `0` to disable animation (static background).
   * Default: 40
   *
   * @example
   * <Watermark speed={0} />   // static
   * <Watermark speed={20} />  // faster
   * <Watermark speed={60} />  // very slow
   */
  speed?: number;
}

const BASE_STYLE = `
html { height: 100dvh; }
.wm-link { transition: opacity 0.15s; }
.wm-link:hover { opacity: 0.35; }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = BASE_STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

function appendUtm(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "m1kapp");
    return u.toString();
  } catch {
    return url;
  }
}

/** Estimate rendered width of a string. CJK chars ≈ 1.0×, Latin ≈ 0.62× font size. */
function estimateWidth(text: string, fontSize: number): number {
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
function splitLines(text: string, fontSize: number, maxWidth: number, maxLines: number): string[] {
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
export function Watermark({
  children,
  color = "#0f172a",
  text = "m1k",
  maxWidth = 430,
  sponsor,
  speed = 40,
}: WatermarkProps) {
  injectStyle();

  const uid = useId().replace(/:/g, "");
  const patternId = `wm-${uid}`;
  const sponsorHref = sponsor ? appendUtm(sponsor.url) : undefined;

  const tileW = 180;
  const tileH = 100;
  const maxTileTextW = tileW * 0.88;
  const textFontSize = Math.max(14, Math.min(28, Math.floor(160 / text.length)));

  // Font size: start from length-based estimate, then try to fit in ≤3 lines
  const rawSponsorFontSize = sponsor
    ? Math.max(14, Math.min(28, Math.floor(160 / sponsor.name.length)))
    : textFontSize;

  const MAX_LINES = 3;
  const sponsorLines = sponsor
    ? splitLines(sponsor.name, rawSponsorFontSize, maxTileTextW, MAX_LINES)
    : [];
  const sponsorFontSize = rawSponsorFontSize;
  const lineH = sponsorFontSize * 1.25;

  const textStyle: React.CSSProperties = {
    fill: "rgba(255,255,255,0.12)",
    fontWeight: 900,
    userSelect: "none",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  };
  const textAttrs = {
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
    textRendering: "geometricPrecision" as const,
    style: textStyle,
  };

  /** Render sponsor text as multiline tspans, vertically centered in the tile */
  function SponsorText({ cx, cy }: { cx: number; cy: number }) {
    if (!sponsor) return null;
    const totalH = (sponsorLines.length - 1) * lineH;
    const startY = cy - totalH / 2;
    return (
      <text x={cx} fontSize={sponsorFontSize} {...textAttrs}>
        {sponsorLines.map((line, i) => (
          <tspan key={i} x={cx} y={startY + i * lineH}>
            {line}
          </tspan>
        ))}
      </text>
    );
  }

  return (
    <div
      className="h-dvh w-full relative overflow-hidden"
      style={{ backgroundColor: color, transition: "background-color 0.5s ease" }}
    >
      {/* Single SVG with <pattern> — tiles are rendered by the browser, no extra DOM nodes */}
      <svg
        className="absolute inset-0 hidden sm:block"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{
          transform: "rotate(-12deg) scale(2)",
          transformOrigin: "center center",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={tileW * 2}
            height={tileH * 2}
            patternUnits="userSpaceOnUse"
          >
            {speed > 0 && (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore — SMIL element not typed in React
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to={`${tileW} ${tileH}`}
                dur={`${speed}s`}
                repeatCount="indefinite"
              />
            )}

            {/* tile (0,0): main text */}
            <text x={tileW * 0.5} y={tileH * 0.5} fontSize={textFontSize} {...textAttrs}>
              {text}
            </text>

            {/* tile (1,0): sponsor or main text */}
            {sponsor ? (
              <a
                href={sponsorHref}
                target="_blank"
                rel="noopener noreferrer"
                className="wm-link"
                style={{ pointerEvents: "auto" }}
              >
                <SponsorText cx={tileW * 1.5} cy={tileH * 0.5} />
              </a>
            ) : (
              <text x={tileW * 1.5} y={tileH * 0.5} fontSize={textFontSize} {...textAttrs}>
                {text}
              </text>
            )}

            {/* tile (0,1): sponsor or main text */}
            {sponsor ? (
              <a
                href={sponsorHref}
                target="_blank"
                rel="noopener noreferrer"
                className="wm-link"
                style={{ pointerEvents: "auto" }}
              >
                <SponsorText cx={tileW * 0.5} cy={tileH * 1.5} />
              </a>
            ) : (
              <text x={tileW * 0.5} y={tileH * 1.5} fontSize={textFontSize} {...textAttrs}>
                {text}
              </text>
            )}

            {/* tile (1,1): main text */}
            <text x={tileW * 1.5} y={tileH * 1.5} fontSize={textFontSize} {...textAttrs}>
              {text}
            </text>
          </pattern>
        </defs>

        {/* rect fills the entire (rotated+scaled) area */}
        <rect
          width="200%"
          height="200%"
          x="-50%"
          y="-50%"
          fill={`url(#${patternId})`}
          style={{ pointerEvents: "none" }}
        />
      </svg>

      {/* sponsor click target — single overlay, content z-10 takes priority */}
      {sponsor && (
        <a
          href={sponsorHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-[1] hidden sm:block"
          aria-label={sponsor.name}
        />
      )}

      {/* content */}
      <div
        className="relative z-10 h-full flex items-center justify-center mx-auto sm:p-3"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
