import type { OGConfig } from "./og";
import { analogousColor, shiftColor, pastelify } from "./og-color";

/* ═══════════════════════════════════════
   공통 레이아웃 쉘
═══════════════════════════════════════ */
// bg 변형별 색 팔레트
const SHELL_PALETTES = {
  blend: {
    logoIconBg: () => "rgba(255,255,255,0.2)",
    logoTextColor: "#ffffff",
    domainColor: "rgba(255,255,255,0.75)",
    dotColor: () => "rgba(255,255,255,0.6)",
    baseBg: (color: string) => pastelify(color, 0.55),
    baseGradient: undefined,
  },
  gradient: {
    logoIconBg: () => "rgba(255,255,255,0.18)",
    logoTextColor: "rgba(255,255,255,0.95)",
    domainColor: "rgba(255,255,255,0.5)",
    dotColor: () => "rgba(255,255,255,0.5)",
    baseBg: () => "#06060a",
    baseGradient: undefined,
  },
  dark: {
    logoIconBg: (color: string) => color,
    logoTextColor: "#e4e4e7",
    domainColor: "#52525b",
    dotColor: (color: string) => color,
    baseBg: () => "#0a0a0c",
    baseGradient: "linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)",
  },
} as const;

function BlendBlobs({ color }: { color: string }) {
  // blend 3색 analogous — 같은 계열의 강렬한 대비
  return (
    <>
      {/* blend blob 1 — 좌상단 (진한 톤) */}
      <div style={{
        position: "absolute", top: -500, left: -400,
        width: 1400, height: 1300, borderRadius: "50%",
        backgroundColor: color, opacity: 0.7,
        filter: "blur(240px)", display: "flex",
      }} />
      {/* blend blob 2 — 우하단 (중간 톤) */}
      <div style={{
        position: "absolute", bottom: -480, right: -380,
        width: 1380, height: 1280, borderRadius: "50%",
        backgroundColor: analogousColor(color, 50), opacity: 0.65,
        filter: "blur(235px)", display: "flex",
      }} />
      {/* blend blob 3 — 중앙 우측 (연한 톤) */}
      <div style={{
        position: "absolute", top: "20%", right: -200,
        width: 1000, height: 900, borderRadius: "50%",
        backgroundColor: analogousColor(color, -50), opacity: 0.6,
        filter: "blur(220px)", display: "flex",
      }} />
    </>
  );
}

function GradientBlobs({ color }: { color: string }) {
  return (
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
  );
}

function DarkGlow({ color }: { color: string }) {
  return (
    <div style={{
      position: "absolute", bottom: -200, left: "30%",
      width: 500, height: 300, borderRadius: "50%",
      backgroundColor: color, opacity: 0.08,
      filter: "blur(80px)", display: "flex",
    }} />
  );
}

export function Shell({
  appName: _appName,
  color = "#007B5F",
  domain,
  bg = "dark",
  logoUrl,
  children,
}: OGConfig & { children: React.ReactNode }) {
  const appName = _appName || "m1k";
  const palette = SHELL_PALETTES[bg] ?? SHELL_PALETTES.dark;

  const logoIconBg = palette.logoIconBg(color);
  const logoIconColor = "#ffffff";
  const logoTextColor = palette.logoTextColor;
  const domainColor = palette.domainColor;
  const dotColor = palette.dotColor(color);

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: palette.baseBg(color),
      ...(palette.baseGradient ? { background: palette.baseGradient } : {}),
      padding: "72px 80px",
      fontFamily: "Pretendard, system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>

      {bg === "blend" ? <BlendBlobs color={color} /> : bg === "gradient" ? <GradientBlobs color={color} /> : <DarkGlow color={color} />}

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

