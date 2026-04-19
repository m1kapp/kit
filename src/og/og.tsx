import * as React from "react";

/* ═══════════════════════════════════════
   공통 설정 (브랜딩)
═══════════════════════════════════════ */
export interface OGConfig {
  /** 앱 이름 (좌상단 로고) */
  appName?: string;
  /** 브랜드 색상 (hex) */
  color?: string;
  /** 하단 도메인 */
  domain?: string;
  /** 배경 스타일 — "dark"(기본) | "gradient"(다크 오로라) | "blend"(라이트 파스텔 블렌드) */
  bg?: "dark" | "gradient" | "blend";
  /** 로고 이미지 URL (지정 시 appName 첫 글자 대신 이미지 표시) */
  logoUrl?: string;
}

/* ═══════════════════════════════════════
   템플릿 variants (discriminated union)
═══════════════════════════════════════ */
export interface OGDefaultTemplate {
  type?: "default";
  title: string;
  sub?: string;
  badge?: string;
}

export interface OGMatchTemplate {
  type: "match";
  home: string;
  away: string;
  score?: string;
  sub?: string;
  badge?: string;
}

export interface OGSquareTemplate {
  type: "square";
  title: string;
  sub?: string;
  badge?: string;
}

export interface OGIconTemplate {
  type: "icon";
  /** 아이콘에 표시할 글자 (기본: appName 첫 글자) */
  letter?: string;
  /** 아이콘 모서리 둥글기 (기본: 96) */
  radius?: number;
}

export interface OGArticleTemplate {
  type: "article";
  title: string;
  /** 작성자 */
  author?: string;
  /** 날짜 또는 발행일 */
  date?: string;
  /** 카테고리 / 태그 */
  category?: string;
  sub?: string;
}

export interface OGStatTemplate {
  type: "stat";
  /** 강조할 숫자 또는 지표 */
  stat: string;
  /** 지표 설명 */
  label: string;
  sub?: string;
  badge?: string;
}

export interface OGProductTemplate {
  type: "product";
  title: string;
  tagline?: string;
  /** 핵심 특징 (최대 3개) */
  features?: string[];
  badge?: string;
}

export type OGTemplate =
  | OGDefaultTemplate
  | OGMatchTemplate
  | OGSquareTemplate
  | OGIconTemplate
  | OGArticleTemplate
  | OGStatTemplate
  | OGProductTemplate;
export type OGProps = OGTemplate & OGConfig;

/* ═══════════════════════════════════════
   이모지 ↔ 텍스트 분리 렌더
═══════════════════════════════════════ */
function splitByEmoji(str: string): string[] {
  const segments: string[] = [];
  const re = /\p{Extended_Pictographic}/gu;
  let last = 0;
  for (const m of str.matchAll(re)) {
    const before = str.slice(last, m.index).trim();
    if (before) segments.push(before);
    segments.push(m[0]);
    last = (m.index as number) + m[0].length;
  }
  const after = str.slice(last).trim();
  if (after) segments.push(after);
  return segments;
}

/** 이모지와 텍스트 사이에 적절한 gap을 주는 인라인 컴포넌트 */
function EmojiText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const parts = splitByEmoji(text);
  if (parts.length <= 1) return <span style={{ display: "flex", ...style }}>{text}</span>;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", ...style }}>
      {parts.map((seg, i) => <span key={i}>{seg}</span>)}
    </span>
  );
}

/* ═══════════════════════════════════════
   hex → rgba 유틸
═══════════════════════════════════════ */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** RGB to HSL 변환 */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = 60 * (((g - b) / d + (g < b ? 6 : 0)) % 6);
  else if (max === g) h = 60 * (((b - r) / d + 2) % 6);
  else h = 60 * (((r - g) / d + 4) % 6);
  return { h, s, l };
}

/** HSL to RGB 변환 */
function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** 색상환에서 인접 색상 생성 (±45도) */
function analogousColor(hex: string, hueShift = 45): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newH = (h + hueShift) % 360;
  const { r: nr, g: ng, b: nb } = hslToRgb(newH, s, l);
  return `rgb(${nr},${ng},${nb})`;
}

function shiftColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return `rgb(${clamp(r + amount)},${clamp(g + amount)},${clamp(b + amount)})`;
}

/** 색상을 흰색과 mix해서 파스텔로 만듦 (mix: 0=원색, 1=흰색) */
function pastelify(hex: string, mix = 0.5): string {
  const { r, g, b } = hexToRgb(hex);
  const p = (v: number) => Math.round(v + (255 - v) * mix);
  return `rgb(${p(r)},${p(g)},${p(b)})`;
}

/** RGB 채널 순환 — 단색에서 유사색 파생 */
function rotatePastel(hex: string, mix = 0.38): string {
  const { r, g, b } = hexToRgb(hex);
  const p = (v: number) => Math.round(v + (255 - v) * mix);
  return `rgb(${p(b)},${p(r)},${p(g)})`; // b→r, r→g, g→b 순환
}

/* ═══════════════════════════════════════
   Badge 컴포넌트
═══════════════════════════════════════ */
function Badge({ text, color, bg = "dark" }: { text: string; color: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  return (
    <div style={{ display: "flex" }}>
      <div style={{
        display: "flex",
        backgroundColor: isBlend ? "rgba(255,255,255,0.2)" : isGrad ? "rgba(255,255,255,0.2)" : rgba(color, 0.12),
        borderRadius: 24,
        paddingLeft: 18, paddingRight: 18, paddingTop: 8, paddingBottom: 8,
      }}>
        <EmojiText
          text={text}
          style={{ fontSize: 22, fontWeight: 700, color: isBlend ? "#ffffff" : isGrad ? "#ffffff" : color, letterSpacing: "0.2px" }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   공통 레이아웃 쉘
═══════════════════════════════════════ */
function Shell({
  appName: _appName,
  color = "#007B5F",
  domain,
  bg = "dark",
  logoUrl,
  children,
}: OGConfig & { children: React.ReactNode }) {
  const appName = _appName || "m1k";
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";

  // 텍스트 색상
  const titleColor  = isBlend ? "#ffffff" : "#ffffff";
  const logoIconBg  = isBlend ? "rgba(255,255,255,0.2)" : isGrad ? "rgba(255,255,255,0.18)" : color;
  const logoIconColor = isBlend ? "#ffffff" : "#ffffff";
  const logoTextColor = isBlend ? "#ffffff" : isGrad ? "rgba(255,255,255,0.95)" : "#e4e4e7";
  const domainColor   = isBlend ? "rgba(255,255,255,0.75)" : isGrad ? "rgba(255,255,255,0.5)" : "#52525b";
  const dotColor      = isBlend ? "rgba(255,255,255,0.6)" : isGrad ? "rgba(255,255,255,0.5)" : color;

  // blend 3색 analogous — 같은 계열의 강렬한 대비
  const blendBlob1 = color;
  const blendBlob2 = analogousColor(color, 50);
  const blendBlob3 = analogousColor(color, -50);

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: isBlend ? pastelify(color, 0.55) : isGrad ? "#06060a" : "#0a0a0c",
      background: (!isGrad && !isBlend) ? "linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)" : undefined,
      padding: "72px 80px",
      fontFamily: "Pretendard, system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>

      {isBlend ? (
        <>
          {/* blend blob 1 — 좌상단 (진한 톤) */}
          <div style={{
            position: "absolute", top: -500, left: -400,
            width: 1400, height: 1300, borderRadius: "50%",
            backgroundColor: blendBlob1, opacity: 0.7,
            filter: "blur(240px)", display: "flex",
          }} />
          {/* blend blob 2 — 우하단 (중간 톤) */}
          <div style={{
            position: "absolute", bottom: -480, right: -380,
            width: 1380, height: 1280, borderRadius: "50%",
            backgroundColor: blendBlob2, opacity: 0.65,
            filter: "blur(235px)", display: "flex",
          }} />
          {/* blend blob 3 — 중앙 우측 (연한 톤) */}
          <div style={{
            position: "absolute", top: "20%", right: -200,
            width: 1000, height: 900, borderRadius: "50%",
            backgroundColor: blendBlob3, opacity: 0.6,
            filter: "blur(220px)", display: "flex",
          }} />
        </>
      ) : isGrad ? (
        <>
          {/* blob 1 — 브랜드 컬러, 좌하단 */}
          <div style={{
            position: "absolute", bottom: -180, left: -80,
            width: 700, height: 560, borderRadius: "50%",
            backgroundColor: color, opacity: 0.8,
            filter: "blur(130px)", display: "flex",
          }} />
          {/* blob 2 — 밝은 브랜드, 우상단 */}
          <div style={{
            position: "absolute", top: -160, right: -60,
            width: 580, height: 480, borderRadius: "50%",
            backgroundColor: shiftColor(color, 70), opacity: 0.6,
            filter: "blur(110px)", display: "flex",
          }} />
          {/* blob 3 — 화이트 하이라이트 */}
          <div style={{
            position: "absolute", top: -80, left: "20%",
            width: 340, height: 260, borderRadius: "50%",
            backgroundColor: "#ffffff", opacity: 0.07,
            filter: "blur(70px)", display: "flex",
          }} />
          {/* blob 4 — 딥 컬러, 우하단 */}
          <div style={{
            position: "absolute", bottom: -60, right: "10%",
            width: 380, height: 300, borderRadius: "50%",
            backgroundColor: shiftColor(color, -50), opacity: 0.4,
            filter: "blur(90px)", display: "flex",
          }} />
          {/* 가독성 오버레이 */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.52)", display: "flex",
          }} />
        </>
      ) : (
        /* 다크 모드 기존 글로우 */
        <div style={{
          position: "absolute", bottom: -200, left: "30%",
          width: 500, height: 300, borderRadius: "50%",
          backgroundColor: color, opacity: 0.08,
          filter: "blur(80px)", display: "flex",
        }} />
      )}

      {/* 로고 */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            width={52} height={52}
            style={{ borderRadius: 14, objectFit: "cover", display: "flex" }}
          />
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            backgroundColor: logoIconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: logoIconColor,
          }}>
            {appName[0].toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: 30, fontWeight: 800, color: logoTextColor, letterSpacing: "-0.5px" }}>
          {appName}
        </span>
      </div>

      {/* 콘텐츠 */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", position: "relative", zIndex: 1 }}>
        {children}
      </div>

      {/* 하단 도메인 */}
      {domain && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            backgroundColor: dotColor,
            display: "flex",
          }} />
          <span style={{ fontSize: 22, color: domainColor, fontWeight: 600 }}>{domain}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Default 템플릿
═══════════════════════════════════════ */
function DefaultLayout({ title, sub, badge, color = "#007B5F", bg = "dark" }: OGDefaultTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
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
function MatchLayout({ home, away, score, sub, badge, color = "#007B5F", bg = "dark" }: OGMatchTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
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
function SquareLayout({ title, sub, badge, color = "#007B5F", bg = "dark" }: OGSquareTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
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

/* ═══════════════════════════════════════
   Icon 템플릿 (512×512)
═══════════════════════════════════════ */
function IconLayout({
  letter,
  radius = 96,
  appName = "m1k",
  color = "#007B5F",
  bg = "dark",
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
        fontSize: 240, fontWeight: 900, color: isBlend ? "#ffffff" : "#ffffff",
        letterSpacing: "-6px", lineHeight: 1.0, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
        textShadow: isBlend ? "0 2px 8px rgba(0,0,0,0.3)" : undefined,
      }}>
        {char}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   Article 템플릿
═══════════════════════════════════════ */
function ArticleLayout({ title, author, date, category, sub, color = "#007B5F", bg = "dark" }: OGArticleTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  const titleColor  = isBlend ? "#ffffff" : "#ffffff";
  const mutedColor  = isGrad ? "rgba(255,255,255,0.55)" : isBlend ? "rgba(255,255,255,0.8)" : "#71717a";
  const accentColor = isGrad ? "rgba(255,255,255,0.9)" : isBlend ? "rgba(255,255,255,0.6)" : color;
  const authorLetterColor = isBlend ? "#000000" : (isGrad ? "#18181b" : "#fff");
  const dotSepColor = isGrad ? "rgba(255,255,255,0.3)" : isBlend ? "rgba(255,255,255,0.5)" : "#3f3f46";
  return (
    <>
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
    </>
  );
}

/* ═══════════════════════════════════════
   Stat 템플릿
═══════════════════════════════════════ */
function StatLayout({ stat, label, sub, badge, color = "#007B5F", bg = "dark" }: OGStatTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  const statColor  = isBlend ? "#ffffff" : isGrad ? "#ffffff" : color;
  const labelColor = isBlend ? "#ffffff" : "#ffffff";
  const mutedColor = isBlend ? "rgba(255,255,255,0.8)" : isGrad ? "rgba(255,255,255,0.55)" : "#71717a";
  return (
    <>
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
    </>
  );
}

/* ═══════════════════════════════════════
   Product 템플릿
═══════════════════════════════════════ */
function ProductLayout({ title, tagline, features, badge, color = "#007B5F", bg = "dark" }: OGProductTemplate & { color?: string; bg?: "dark" | "gradient" | "blend" }) {
  const isGrad = bg === "gradient";
  const isBlend = bg === "blend";
  const titleColor   = isBlend ? "#ffffff" : "#ffffff";
  const taglineColor = isGrad ? "rgba(255,255,255,0.75)" : isBlend ? "rgba(255,255,255,0.85)" : "#a1a1aa";
  const featureColor = isGrad ? "rgba(255,255,255,0.7)" : isBlend ? "rgba(255,255,255,0.8)" : "#a1a1aa";
  const dotColor     = isGrad ? "rgba(255,255,255,0.5)" : isBlend ? "rgba(255,255,255,0.6)" : color;
  const list = (features ?? []).slice(0, 3);
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
    </>
  );
}

/* ═══════════════════════════════════════
   단일 진입점
═══════════════════════════════════════ */
export function OGImage(props: OGProps) {
  const { appName, color, domain, bg, logoUrl } = props;
  const type = props.type ?? "default";

  if (type === "icon") {
    return <IconLayout {...(props as OGIconTemplate)} appName={appName} color={color} bg={bg} />;
  }

  return (
    <Shell appName={appName} color={color} domain={domain} bg={bg} logoUrl={logoUrl}>
      {type === "match" ? (
        <MatchLayout {...(props as OGMatchTemplate)} color={color} bg={bg} />
      ) : type === "square" ? (
        <SquareLayout {...(props as OGSquareTemplate)} color={color} bg={bg} />
      ) : type === "article" ? (
        <ArticleLayout {...(props as OGArticleTemplate)} color={color} bg={bg} />
      ) : type === "stat" ? (
        <StatLayout {...(props as OGStatTemplate)} color={color} bg={bg} />
      ) : type === "product" ? (
        <ProductLayout {...(props as OGProductTemplate)} color={color} bg={bg} />
      ) : (
        <DefaultLayout {...(props as OGDefaultTemplate)} color={color} bg={bg} />
      )}
    </Shell>
  );
}
