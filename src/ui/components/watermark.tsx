import { type CSSProperties, type ReactNode, useId } from "react";
import { PoweredByKit } from "./powered-by";

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
  /**
   * Hide the "powered by @m1kapp/kit" badge at the bottom.
   * Default: false (badge is shown)
   */
  hidePoweredBy?: boolean;
  /**
   * m1k.app visitor-tracker slug, forwarded to the embedded PoweredByKit badge.
   * Falls back to `NEXT_PUBLIC_M1K_SLUG` on Next. Vite apps pass it explicitly:
   * `trackSlug={import.meta.env.VITE_M1K_SLUG}` — Vite only substitutes
   * `import.meta.env` in app source, never inside kit's own bundle.
   * No slug → no tracking (off by default).
   */
  trackSlug?: string;
  /** Set false to disable the visitor beacon even when a slug is present */
  track?: boolean;
  /** Mark the site as claimed (인증됨). When tracking but not claimed, a "미인증" marker shows. */
  claimed?: boolean;
  /** Visitor counts for the footer ({ today, total }). Omit to auto-fetch from m1k.app. */
  counts?: { today?: number; total?: number };
  /**
   * Scale up the shell + credit group on wide screens, so a 430px phone shell
   * doesn't shrink to a sliver in a field of watermark (it covers ~26% of a
   * 1440px screen but only ~10% of a 2560px one).
   *
   * Default: `true` — a continuous scale driven by viewport width and capped
   * by available viewport height. Wide-but-short screens stay at a smaller
   * factor so flex layout never squashes the shell's proportions. The factor
   * tops out at ×1.5 (see `.kit-stage`). Pass a number to pin one fixed factor
   * everywhere, or `false` for 1:1 always. The watermark background itself is
   * never scaled; it always fills the viewport.
   */
  zoom?: boolean | number;
}

import { splitLines, injectStyle, appendUtm } from "./watermark-text";


/** Estimate rendered width of a string. CJK chars ≈ 1.0×, Latin ≈ 0.62× font size. */
/**
 * `color` 는 액센트를 그대로 넣지 말 것 — 쨍한 색 위 워터마크 글자가 앱보다
 * 시끄럽다. `watermarkTint(accent)`(utils)로 어두운 저채도 틴트를 만들어 쓴다.
 */
export function Watermark({
  children,
  color = "#0f172a",
  text = "m1k",
  maxWidth = 430,
  sponsor,
  speed = 40,
  hidePoweredBy = false,
  trackSlug,
  track,
  claimed,
  counts,
  zoom = true,
}: WatermarkProps) {
  injectStyle();

  // `.kit-stage` derives --kit-zoom from width and height clamps by default. An
  // inline declaration on this same element outranks it (style attribute beats
  // any selector-based rule), so `zoom={false}`/`zoom={n}` just override the var.
  const zoomVars =
    zoom === true ? undefined : ({ "--kit-zoom": String(zoom === false ? 1 : zoom) } as CSSProperties);

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
      className="h-dvh w-full relative overflow-clip"
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

      {/* content — shell + powered-by kept as one group, directly adjacent
          (no gap between them), and that whole group is vertically centered
          in the viewport via equal top/bottom spacers. The badge moves with
          the shell, sitting just under it — it does not pin to the true
          bottom edge of the screen. */}
      <div
        className="kit-stage relative z-10 flex flex-col items-center mx-auto sm:p-3 sm:gap-1"
        style={{ maxWidth, ...zoomVars }}
      >
        <div className="flex-1 min-h-0" />
        {children}
        {!hidePoweredBy && <PoweredByKit variant="overlay" slug={trackSlug} track={track} claimed={claimed} counts={counts} />}
        <div className="flex-1 min-h-0" />
      </div>
    </div>
  );
}
