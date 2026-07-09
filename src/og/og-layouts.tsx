import type { OGDefaultTemplate, OGMatchTemplate, OGSquareTemplate } from "./og";
import { EmojiText, Badge } from "./og-shared";
import { rgba } from "./og-color";

/* ═══════════════════════════════════════
   Default 템플릿
═══════════════════════════════════════ */
export function DefaultLayout({ title, sub, badge, color = "#007B5F", bg = "dark" }: OGDefaultTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isBlend = bg === "blend";
  const titleColor = isBlend ? "#ffffff" : "#ffffff";
  const subColor = bg === "gradient" ? "rgba(255,255,255,0.72)" : isBlend ? "rgba(255,255,255,0.85)" : "#a1a1aa";
  return (
    <>
      {badge && (
        <div style={{ display: "flex", marginBottom: 20 }}>
          <Badge text={badge} color={color} bg={bg} />
        </div>
      )}
      <EmojiText text={title} style={{
        fontSize: 72, fontWeight: 900, color: titleColor,
        letterSpacing: "-2px", lineHeight: 1.1,
      }} />
      {sub && (
        <EmojiText text={sub} style={{
          fontSize: 34, color: subColor, marginTop: 22, fontWeight: 500,
        }} />
      )}
    </>
  );
}

/* ═══════════════════════════════════════
   Match 템플릿
═══════════════════════════════════════ */
export function MatchLayout({ home, away, score, sub, badge, color = "#007B5F", bg = "dark" }: OGMatchTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  const titleColor = isBlend ? "#ffffff" : "#ffffff";
  const subColor = isGrad ? "rgba(255,255,255,0.9)" : isBlend ? "rgba(255,255,255,0.85)" : color;
  const scoreColor = isGrad ? "rgba(255,255,255,0.6)" : isBlend ? "rgba(255,255,255,0.9)" : rgba(color, 0.6);
  const vsColor = isGrad ? "rgba(255,255,255,0.35)" : isBlend ? rgba(color, 0.5) : rgba(color, 0.35);
  return (
    <>
      {sub && (
        <EmojiText text={sub} style={{ fontSize: 28, color: subColor, fontWeight: 700, marginBottom: 24 }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <span style={{ fontSize: 64, fontWeight: 900, color: titleColor, letterSpacing: "-1.5px" }}>
          {home}
        </span>
        {score ? (
          <span style={{ fontSize: 48, fontWeight: 900, color: scoreColor, letterSpacing: "3px" }}>
            {score}
          </span>
        ) : (
          <span style={{ fontSize: 36, fontWeight: 700, color: vsColor }}>vs</span>
        )}
        <span style={{ fontSize: 64, fontWeight: 900, color: "#ffffff", letterSpacing: "-1.5px" }}>
          {away}
        </span>
      </div>
      {badge && (
        <div style={{ display: "flex", marginTop: 24 }}>
          <Badge text={badge} color={color} bg={bg} />
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════
   Square 템플릿 (1200×1200)
═══════════════════════════════════════ */
export function SquareLayout({ title, sub, badge, color = "#007B5F", bg = "dark" }: OGSquareTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isBlend = bg === "blend";
  const titleColor = isBlend ? "#ffffff" : "#ffffff";
  const subColor = bg === "gradient" ? "rgba(255,255,255,0.72)" : isBlend ? "rgba(255,255,255,0.85)" : "#71717a";
  return (
    <>
      {badge && (
        <div style={{ display: "flex", marginBottom: 24 }}>
          <Badge text={badge} color={color} bg={bg} />
        </div>
      )}
      <EmojiText text={title} style={{
        fontSize: 80, fontWeight: 900, color: titleColor,
        letterSpacing: "-2px", lineHeight: 1.15,
      }} />
      {sub && (
        <EmojiText text={sub} style={{
          fontSize: 38, color: subColor, marginTop: 28, fontWeight: 500,
        }} />
      )}
    </>
  );
}

