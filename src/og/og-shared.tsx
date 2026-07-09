import { rgba } from "./og-color";

/* ═══════════════════════════════════════
   이모지 ↔ 텍스트 분리 렌더
═══════════════════════════════════════ */
export function splitByEmoji(str: string): string[] {
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
export function EmojiText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const parts = splitByEmoji(text);
  if (parts.length <= 1) return <span style={{ display: "flex", ...style }}>{text}</span>;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", ...style }}>
      {parts.map((seg, i) => <span key={i}>{seg}</span>)}
    </span>
  );
}

/* ═══════════════════════════════════════
   Badge 컴포넌트
═══════════════════════════════════════ */
export function Badge({ text, color, bg = "dark" }: { text: string; color: string; bg?: "dark" | "gradient" | "blend" }) {
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


