import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';

interface OGConfig {
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
interface OGDefaultTemplate {
    type?: "default";
    title: string;
    sub?: string;
    badge?: string;
}
interface OGMatchTemplate {
    type: "match";
    home: string;
    away: string;
    score?: string;
    sub?: string;
    badge?: string;
}
interface OGSquareTemplate {
    type: "square";
    title: string;
    sub?: string;
    badge?: string;
}
interface OGIconTemplate {
    type: "icon";
    /** 아이콘에 표시할 글자 (기본: appName 첫 글자) */
    letter?: string;
    /** 아이콘 모서리 둥글기 (기본: 96) */
    radius?: number;
    /** 글자 크기 (기본: 240, 작은 아이콘은 줄여서 사용) */
    fontSize?: number;
}
interface OGArticleTemplate {
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
interface OGStatTemplate {
    type: "stat";
    /** 강조할 숫자 또는 지표 */
    stat: string;
    /** 지표 설명 */
    label: string;
    sub?: string;
    badge?: string;
}
interface OGProductTemplate {
    type: "product";
    title: string;
    tagline?: string;
    /** 핵심 특징 (최대 3개) */
    features?: string[];
    badge?: string;
}
type OGTemplate = OGDefaultTemplate | OGMatchTemplate | OGSquareTemplate | OGIconTemplate | OGArticleTemplate | OGStatTemplate | OGProductTemplate;
type OGProps = OGTemplate & OGConfig;
interface FaviconElementOptions {
    /** 표시할 텍스트 (기본: appName 첫 글자) */
    text?: string;
    /** 앱 이름 — text 미지정 시 첫 글자 사용 */
    appName?: string;
    /** 배경색 (hex, 기본: #0f0f1a) */
    color?: string;
    /** 이미지 크기 px (기본: 512) */
    size?: number;
}
declare function createFaviconElement({ text, appName, color, size, }?: FaviconElementOptions): React.ReactElement;
declare function OGImage(props: OGProps): react_jsx_runtime.JSX.Element;

/** @vercel/og (Satori) fonts 옵션에 넘길 수 있는 폰트 정의 */
interface OGFont {
    name: string;
    data: ArrayBuffer;
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    style?: "normal" | "italic";
}
declare const PRETENDARD_WEIGHTS: {
    readonly 400: "Pretendard-Regular.otf";
    readonly 700: "Pretendard-Bold.otf";
    readonly 900: "Pretendard-Black.otf";
};
type PretendardWeight = keyof typeof PRETENDARD_WEIGHTS;
/**
 * Pretendard 폰트를 CDN에서 로드합니다.
 *
 * @example
 * ```ts
 * import { OG, loadPretendard } from "@m1kapp/seo";
 * import { ImageResponse } from "next/og";
 *
 * export async function GET() {
 *   const fonts = await loadPretendard();
 *   return new ImageResponse(<OG type="default" title="Hello" />, {
 *     width: 1200, height: 630, fonts,
 *   });
 * }
 * ```
 *
 * @param weights 로드할 weight 배열 (기본: [700, 900])
 */
declare function loadPretendard(weights?: PretendardWeight[]): Promise<OGFont[]>;
/**
 * 임의의 URL에서 폰트를 로드합니다.
 *
 * @example
 * ```ts
 * const fonts = await loadFont({
 *   name: "CustomFont",
 *   url: "https://example.com/CustomFont-Bold.otf",
 *   weight: 700,
 * });
 * ```
 */
declare function loadFont(opts: {
    name: string;
    url: string;
    weight?: OGFont["weight"];
    style?: OGFont["style"];
}): Promise<OGFont>;
/**
 * Google Fonts에서 폰트를 로드합니다.
 * CSS 응답을 파싱해 TTF/OTF URL을 자동 추출합니다.
 *
 * @example
 * ```ts
 * const fonts = await loadGoogleFont("Noto Sans KR", [400, 700]);
 * return new ImageResponse(<OG ... />, { fonts });
 * ```
 */
declare function loadGoogleFont(family: string, weights?: OGFont["weight"][]): Promise<OGFont[]>;

/**
 * @vercel/og ImageResponse에서 지원하는 이모지 스타일.
 * ImageResponse 옵션의 `emoji` 필드에 넘기면 됩니다.
 */
type EmojiStyle = "twemoji" | "openmoji" | "noto" | "fluent" | "fluentFlat" | "blobmoji";
/**
 * raw Satori의 `loadAdditionalAsset` 콜백을 생성합니다.
 *
 * @example
 * ```ts
 * import satori from "satori";
 * import { createEmojiLoader } from "@m1kapp/seo";
 *
 * const svg = await satori(<OG ... />, {
 *   width: 1200, height: 630,
 *   fonts: [...],
 *   loadAdditionalAsset: createEmojiLoader(),
 * });
 * ```
 */
declare function createEmojiLoader(): (code: string, segment: string) => Promise<string | undefined>;

/**
 * OG 이미지 URL의 캐시를 즉시 무효화할 버전 키를 반환합니다.
 *
 * Cache-Control로 CDN에 캐싱된 OG 이미지를 강제 갱신하고 싶을 때
 * URL의 `v` 파라미터에 이 값을 넣으세요.
 *
 * @example
 * ```ts
 * import { getOGVersion } from "@m1kapp/seo";
 *
 * // OG 갱신 버튼 핸들러
 * const freshUrl = `/og?title=${title}&v=${getOGVersion()}`;
 * // → /og?title=...&v=20260415152347
 * ```
 */
declare function getOGVersion(): string;

export { type EmojiStyle, type FaviconElementOptions, type OGArticleTemplate, type OGConfig, type OGDefaultTemplate, type OGFont, type OGIconTemplate, OGImage, type OGMatchTemplate, type OGProductTemplate, type OGProps, type OGSquareTemplate, type OGStatTemplate, type OGTemplate, createEmojiLoader, createFaviconElement, getOGVersion, loadFont, loadGoogleFont, loadPretendard };
