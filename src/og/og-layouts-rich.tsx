import type { OGConfig, OGIconTemplate, OGArticleTemplate, OGStatTemplate, OGProductTemplate } from "./og";
import { EmojiText, Badge } from "./og-shared";
import { rotatePastel, pastelify, shiftColor, analogousColor, rgba } from "./og-color";

/* ═══════════════════════════════════════
   Icon 템플릿 (512×512)
═══════════════════════════════════════ */
export function IconLayout({
  letter,
  radius = 96,
  appName = "m1k",
  color = "#007B5F",
  bg = "dark",
  fontSize = 240,
}: OGIconTemplate & OGConfig) {
  const name = appName || "m1k";
  const char = letter ?? name[0].toUpperCase();
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";

  const iconBgColor = isBlend ? pastelify(color, 0.55) : isGrad ? "#06060a" : color;
  const blendBlob1 = color;
  const blendBlob2 = analogousColor(color, 50);
  const blendBlob3 = analogousColor(color, -50);

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex",
      alignItems: "center", justifyContent: "center",
      backgroundColor: iconBgColor,
      borderRadius: radius,
      fontFamily: "Pretendard, system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {isBlend ? (
        <>
          <div style={{ position: "absolute", top: -280, left: -250, width: 800, height: 750, borderRadius: "50%", backgroundColor: blendBlob1, opacity: 0.62, filter: "blur(200px)", display: "flex" }} />
          <div style={{ position: "absolute", bottom: -260, right: -220, width: 780, height: 730, borderRadius: "50%", backgroundColor: blendBlob2, opacity: 0.58, filter: "blur(195px)", display: "flex" }} />
          <div style={{ position: "absolute", top: "25%", right: -100, width: 600, height: 550, borderRadius: "50%", backgroundColor: blendBlob3, opacity: 0.55, filter: "blur(180px)", display: "flex" }} />
        </>
      ) : isGrad ? (
        <>
          <div style={{ position: "absolute", bottom: -100, left: -80, width: 420, height: 380, borderRadius: "50%", backgroundColor: color, opacity: 0.7, filter: "blur(100px)", display: "flex" }} />
          <div style={{ position: "absolute", top: -80, right: -60, width: 350, height: 320, borderRadius: "50%", backgroundColor: shiftColor(color, 70), opacity: 0.45, filter: "blur(90px)", display: "flex" }} />
          <div style={{ position: "absolute", top: -40, left: "25%", width: 200, height: 150, borderRadius: "50%", backgroundColor: "#ffffff", opacity: 0.07, filter: "blur(60px)", display: "flex" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", backgroundColor: "#ffffff", opacity: 0.1, filter: "blur(80px)", display: "flex" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", backgroundColor: "#000000", opacity: 0.15, filter: "blur(60px)", display: "flex" }} />
        </>
      )}
      <span style={{
        fontSize, fontWeight: 900, color: isBlend ? "#ffffff" : "#ffffff",
        letterSpacing: `${(-fontSize * 0.025).toFixed(1)}px`, lineHeight: 1.0, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
        ...(isBlend ? { textShadow: "0 2px 8px rgba(0,0,0,0.3)" } : {}),
      }}>
        {char}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   Article 템플릿
═══════════════════════════════════════ */
// Article 템플릿 bg 변형별 팔레트 (accent만 dark에서 브랜드색 사용)
const ARTICLE_PALETTES = {
  gradient: { muted: "rgba(255,255,255,0.55)", accent: (_c: string) => "rgba(255,255,255,0.9)", authorLetter: "#18181b", dotSep: "rgba(255,255,255,0.3)" },
  blend:    { muted: "rgba(255,255,255,0.8)",  accent: (_c: string) => "rgba(255,255,255,0.6)", authorLetter: "#000000", dotSep: "rgba(255,255,255,0.5)" },
  dark:     { muted: "#71717a",                accent: (c: string) => c,                        authorLetter: "#fff",    dotSep: "#3f3f46" },
} as const;

export function ArticleLayout({ title, author, date, category, sub, color = "#007B5F", bg = "dark" }: OGArticleTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const p = ARTICLE_PALETTES[bg] ?? ARTICLE_PALETTES.dark;
  const titleColor = "#ffffff";
  const mutedColor = p.muted;
  const accentColor = p.accent(color);
  const authorLetterColor = p.authorLetter;
  const dotSepColor = p.dotSep;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {category && (
        <div style={{ display: "flex", marginBottom: 20 }}>
          <Badge text={category} color={color} bg={bg} />
        </div>
      )}
      <EmojiText text={title} style={{
        fontSize: 64, fontWeight: 900, color: titleColor,
        letterSpacing: "-1.5px", lineHeight: 1.15,
      }} />
      {sub && (
        <EmojiText text={sub} style={{ fontSize: 30, color: mutedColor, marginTop: 18, fontWeight: 500 }} />
      )}
      {(author || date) && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
          {author && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: authorLetterColor,
              }}>
                {author[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 22, color: mutedColor, fontWeight: 600 }}>{author}</span>
            </div>
          )}
          {author && date && (
            <span style={{ fontSize: 20, color: dotSepColor, display: "flex" }}>·</span>
          )}
          {date && (
            <span style={{ fontSize: 22, color: mutedColor, fontWeight: 500, display: "flex" }}>{date}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Stat 템플릿
═══════════════════════════════════════ */
export function StatLayout({ stat, label, sub, badge, color = "#007B5F", bg = "dark" }: OGStatTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  const statColor  = isBlend ? "#ffffff" : isGrad ? "#ffffff" : color;
  const labelColor = isBlend ? "#ffffff" : "#ffffff";
  const mutedColor = isBlend ? "rgba(255,255,255,0.8)" : isGrad ? "rgba(255,255,255,0.55)" : "#71717a";
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {badge && (
        <div style={{ display: "flex", marginBottom: 20 }}>
          <Badge text={badge} color={color} bg={bg} />
        </div>
      )}
      <EmojiText text={stat} style={{
        fontSize: 110, fontWeight: 900,
        color: statColor,
        letterSpacing: "-4px", lineHeight: 1,
      }} />
      <div style={{
        fontSize: 36, fontWeight: 700, color: labelColor,
        marginTop: 12, display: "flex",
      }}>
        {label}
      </div>
      {sub && (
        <EmojiText text={sub} style={{ fontSize: 26, color: mutedColor, marginTop: 14, fontWeight: 500 }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Product 템플릿
═══════════════════════════════════════ */
export function ProductLayout({ title, tagline, features, badge, color = "#007B5F", bg = "dark" }: OGProductTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  const titleColor   = isBlend ? "#ffffff" : "#ffffff";
  const taglineColor = isGrad ? "rgba(255,255,255,0.75)" : isBlend ? "rgba(255,255,255,0.85)" : "#a1a1aa";
  const featureColor = isGrad ? "rgba(255,255,255,0.7)" : isBlend ? "rgba(255,255,255,0.8)" : "#a1a1aa";
  const dotColor     = isGrad ? "rgba(255,255,255,0.5)" : isBlend ? "rgba(255,255,255,0.6)" : color;
  const list = (features ?? []).slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {badge && (
        <div style={{ display: "flex", marginBottom: 20 }}>
          <Badge text={badge} color={color} bg={bg} />
        </div>
      )}
      <EmojiText text={title} style={{
        fontSize: 72, fontWeight: 900, color: titleColor,
        letterSpacing: "-2px", lineHeight: 1.1,
      }} />
      {tagline && (
        <EmojiText text={tagline} style={{ fontSize: 32, color: taglineColor, marginTop: 16, fontWeight: 500 }} />
      )}
      {list.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          {list.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor, display: "flex", flexShrink: 0 }} />
              <EmojiText text={f} style={{ fontSize: 24, color: featureColor, fontWeight: 500 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

