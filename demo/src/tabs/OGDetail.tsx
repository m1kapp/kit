import { useState } from "react";
import { Section, SectionHeader, Divider } from "@m1kapp/kit";
import { OGImage } from "@m1kapp/kit/ogimage";
import type { OGProps } from "@m1kapp/kit/ogimage";
import { CodeCard } from "../shared";
import { getOGCode } from "../sections/ogCode";
import type { OGBg } from "../sections/ogCode";

/* ══════════════════════════════════════════════
   OG Preview (scaled render)
══════════════════════════════════════════════ */
function OGPreview({ props, size = "default" }: { props: OGProps; size?: "default" | "square" | "icon" }) {
  const W = size === "square" ? 1200 : size === "icon" ? 512 : 1200;
  const H = size === "square" ? 1200 : size === "icon" ? 512 : 630;
  const SCALE = 0.295;
  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg"
      style={{ width: W * SCALE, height: H * SCALE, flexShrink: 0 }}
    >
      <div style={{ width: W, height: H, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
        <OGImage {...props} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   OG Detail
══════════════════════════════════════════════ */
const TEMPLATES = [
  { id: "default",  label: "Default",  size: "default" as const },
  { id: "article",  label: "Article",  size: "default" as const },
  { id: "stat",     label: "Stat",     size: "default" as const },
  { id: "product",  label: "Product",  size: "default" as const },
  { id: "match",    label: "Match",    size: "default" as const },
  { id: "square",   label: "Square",   size: "square" as const },
  { id: "icon",     label: "Icon",     size: "icon" as const },
] as const;

function getOGProps(templateId: string, color: string, bg: OGBg): OGProps {
  const base = { appName: "m1kapp", color, bg, domain: "m1k.app" };
  switch (templateId) {
    case "default":
      return { ...base, type: "default", title: "사이드 프로젝트\n시작하기", sub: "빠르게 만들고 빠르게 배우는", badge: "🚀 NEW" };
    case "article":
      return { ...base, type: "article", title: "React에서 PWA 구현하기", author: "minho", date: "2025-04-19", category: "📝 Tutorial", sub: "서비스 워커부터 설치 유도까지" };
    case "stat":
      return { ...base, type: "stat", stat: "1,000", label: "명의 방문자", sub: "론칭 3일 만에 달성", badge: "🎉 마일스톤" };
    case "product":
      return { ...base, type: "product", title: "@m1kapp/kit", tagline: "사이드 프로젝트를 위한 올인원 킷", features: ["UI 컴포넌트 18개", "OG 이미지 7가지 템플릿", "PWA 설치 유도 버튼"], badge: "v0.1.0" };
    case "match":
      return { ...base, type: "match", home: "Team A", away: "Team B", score: "2:1", sub: "2025 시즌 파이널", badge: "⚽ LIVE" };
    case "square":
      return { ...base, type: "square", title: "m1k.app", sub: "방문자 1,000명을 향한 여정", badge: "📊 Analytics" };
    case "icon":
      return { ...base, type: "icon", letter: "K" };
    default:
      return { ...base, type: "default", title: "Hello World" };
  }
}

export function OGDetail({ themeColor }: { themeColor: string }) {
  const [templateId, setTemplateId] = useState<string>("default");
  const [bg, setBg] = useState<OGBg>("dark");

  const current = TEMPLATES.find((t) => t.id === templateId)!;
  const ogProps = getOGProps(templateId, themeColor, bg);
  const code = getOGCode(templateId, themeColor, bg);

  const bgLabels: { id: OGBg; label: string }[] = [
    { id: "dark", label: "Dark" },
    { id: "gradient", label: "Gradient" },
    { id: "blend", label: "Blend" },
  ];

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Next.js Route Handler에서 OG 이미지를 코드로 생성해요.
          7가지 템플릿 × 3가지 배경 스타일을 지원해요.
        </p>
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <strong className="text-zinc-700 dark:text-zinc-300">Next.js 14+</strong>는 <code className="font-mono">next/og</code>가 내장돼 있어 별도 설치 불필요.
            그 외 환경은 <code className="font-mono">npm i @vercel/og</code>
          </p>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>템플릿 미리보기</SectionHeader>

        {/* Template selector */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                templateId === t.id
                  ? "text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              style={templateId === t.id ? { backgroundColor: themeColor } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bg selector */}
        <div className="flex gap-1.5 mb-4">
          {bgLabels.map((b) => (
            <button
              key={b.id}
              onClick={() => setBg(b.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                bg === b.id
                  ? "border-zinc-400 dark:border-zinc-500 text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-3">
          <OGPreview props={ogProps} size={current.size} />
        </div>

        {/* Size badge */}
        <p className="text-[10px] text-zinc-400 font-mono text-center mb-4">
          {current.size === "icon" ? "512 × 512" : current.size === "square" ? "1200 × 1200" : "1200 × 630"}
          {" — "}{current.label} template
        </p>

        <CodeCard title="app/og/route.tsx" code={code} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>폰트 / 이모지</SectionHeader>
        <div className="space-y-2">
          <CodeCard title="loadPretendard" code={`import { loadPretendard } from "@m1kapp/kit";

export async function GET() {
  const font = await loadPretendard();
  return new ImageResponse(<OG ... />, {
    width: 1200, height: 630,
    fonts: [font],
  });
}`} />
          <CodeCard title="createEmojiLoader" code={`import { createEmojiLoader } from "@m1kapp/kit";

const loadEmoji = createEmojiLoader("twemoji");
// ImageResponse의 이모지 fallback으로 사용`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}
