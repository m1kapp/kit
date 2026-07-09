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
  /** 글자 크기 (기본: 240, 작은 아이콘은 줄여서 사용) */
  fontSize?: number;
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


import { Shell } from "./og-shell";
import { DefaultLayout, MatchLayout, SquareLayout } from "./og-layouts";
import { IconLayout, ArticleLayout, StatLayout, ProductLayout } from "./og-layouts-rich";

/* ═══════════════════════════════════════
   단일 진입점
═══════════════════════════════════════ */
/* ═══════════════════════════════════════
   createFaviconElement
   Node.js 스크립트에서 favicon PNG/ICO 생성용.
   ImageResponse에 직접 전달하세요.

   @example
   import { createFaviconElement } from "@m1kapp/kit/ogimage";
   import { ImageResponse } from "@vercel/og";

   const res = new ImageResponse(
     createFaviconElement({ appName: "my app", color: "#007B5F", size: 512 }),
     { width: 512, height: 512 }
   );
   const buf = Buffer.from(await res.arrayBuffer());
═══════════════════════════════════════ */
export interface FaviconElementOptions {
  /** 표시할 텍스트 (기본: appName 첫 글자) */
  text?: string;
  /** 앱 이름 — text 미지정 시 첫 글자 사용 */
  appName?: string;
  /** 배경색 (hex, 기본: #0f0f1a) */
  color?: string;
  /** 이미지 크기 px (기본: 512) */
  size?: number;
}

export function createFaviconElement({
  text,
  appName = "app",
  color = "#0f0f1a",
  size = 512,
}: FaviconElementOptions = {}): React.ReactElement {
  const label = text ?? appName;
  const fontSize = size * (label.length === 1 ? 0.6 : label.length <= 3 ? 0.42 : 0.3);

  return (
    <div style={{
      width: size, height: size,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: color,
    }}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: `${size * 0.02}px`,
        alignItems: "center",
      }}>
        {label.split("").map((char, i) => (
          <span key={i} style={{
            fontSize,
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1,
          }}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

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
