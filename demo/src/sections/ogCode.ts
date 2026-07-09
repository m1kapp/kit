export type OGBg = "dark" | "gradient" | "blend";

export function getOGCode(templateId: string, color: string, bg: OGBg): string {
  switch (templateId) {
    case "default":
      return `import { OGImage } from "@m1kapp/kit";
import { ImageResponse } from "next/og"; // Next.js 14+ 내장

export function GET() {
  return new ImageResponse(
    <OGImage
      type="default"
      title="사이드 프로젝트 시작하기"
      sub="빠르게 만들고 빠르게 배우는"
      badge="🚀 NEW"
      appName="m1kapp"
      color="${color}"
      bg="${bg}"
      domain="m1k.app"
    />,
    { width: 1200, height: 630 }
  );
}`;
    case "article":
      return `<OGImage
  type="article"
  title="React에서 PWA 구현하기"
  author="minho"
  date="2025-04-19"
  category="📝 Tutorial"
  sub="서비스 워커부터 설치 유도까지"
  color="${color}" bg="${bg}"
/>`;
    case "stat":
      return `<OGImage
  type="stat"
  stat="1,000"
  label="명의 방문자"
  sub="론칭 3일 만에 달성"
  badge="🎉 마일스톤"
  color="${color}" bg="${bg}"
/>`;
    case "product":
      return `<OGImage
  type="product"
  title="@m1kapp/kit"
  tagline="사이드 프로젝트를 위한 올인원 킷"
  features={[
    "UI 컴포넌트 18개",
    "OG 이미지 7가지 템플릿",
    "PWA 설치 유도 버튼",
  ]}
  badge="v0.1.0"
  color="${color}" bg="${bg}"
/>`;
    case "match":
      return `<OGImage
  type="match"
  home="Team A" away="Team B"
  score="2:1"
  sub="2025 시즌 파이널"
  badge="⚽ LIVE"
  color="${color}" bg="${bg}"
/>`;
    case "square":
      return `// 1200×1200 — Instagram / SNS 정사각형
<OGImage
  type="square"
  title="m1k.app"
  sub="방문자 1,000명을 향한 여정"
  badge="📊 Analytics"
  color="${color}" bg="${bg}"
/>
// ImageResponse: { width: 1200, height: 1200 }`;
    case "icon":
      return `// 512×512 — 앱 아이콘 / favicon
<OGImage
  type="icon"
  letter="K"
  appName="m1kapp"
  color="${color}" bg="${bg}"
/>
// ImageResponse: { width: 512, height: 512 }`;
    default:
      return "";
  }
}
