import { useState } from "react";
import { ChevronRightIcon } from "../shared";
import { Section, SectionHeader } from "@m1kapp/kit";
import { BackIcon } from "../shared";
import { UIDetail } from "./UIDetail";
import { OGDetail } from "./OGDetail";
import { PWADetail } from "./PWADetail";
import { FetchDetail } from "./FetchDetail";
import { UtilsDetail } from "./UtilsDetail";
import { ServerDetail } from "./ServerDetail";
import { SeoDetail } from "./SeoDetail";

/* ══════════════════════════════════════════════
   Library List (Home)
══════════════════════════════════════════════ */
const LIBRARIES = [
  {
    id: "ui" as const,
    icon: "🧩",
    name: "UI",
    package: "@m1kapp/kit",
    desc: "모바일 앱 셸 컴포넌트 모음. AppShell, TabBar, Stepper, BarList 등 45개.",
    stats: [{ label: "컴포넌트", value: 45 }],
    requires: "react, react-dom",
    tags: ["AppShell", "TabBar", "Switch", "Stepper", "Collapsible", "Select", "BarList", "Carousel"],
  },
  {
    id: "og" as const,
    icon: "🖼",
    name: "OG Image",
    package: "@m1kapp/kit",
    desc: "Next.js OG 이미지 생성기. 7가지 템플릿 × 3가지 배경.",
    stats: [{ label: "템플릿", value: 7 }, { label: "배경 스타일", value: 3 }],
    requires: "next/og (Next.js 내장)",
    tags: ["OGImage", "loadPretendard", "loadGoogleFont", "createEmojiLoader"],
  },
  {
    id: "pwa" as const,
    icon: "📱",
    name: "PWA",
    package: "@m1kapp/kit",
    desc: "manifest 생성기, viewport, 앱 설치 유도 버튼까지 한 번에.",
    stats: [{ label: "유틸", value: 3 }, { label: "컴포넌트", value: 2 }],
    requires: "next (Viewport 타입)",
    tags: ["createManifest", "svgIcon", "mobileViewport", "PWAInstallButton"],
  },
  {
    id: "fetch" as const,
    icon: "🌐",
    name: "Fetch",
    package: "@m1kapp/kit",
    desc: "캐싱·중복제거·재시도·포커스 revalidate가 포함된 fetch 유틸.",
    stats: [{ label: "훅", value: 2 }, { label: "유틸", value: 2 }],
    requires: null,
    tags: ["useFetch", "usePolling", "createApiClient", "ApiError"],
  },
  {
    id: "utils" as const,
    icon: "🛠",
    name: "Utils",
    package: "@m1kapp/kit",
    desc: "날짜·숫자 포맷, 클래스 유틸, 범용 훅 모음. 어디서나 그냥 쓰면 됩니다.",
    stats: [{ label: "순수 유틸", value: 4 }, { label: "훅", value: 3 }],
    requires: null,
    tags: ["relativeTime", "formatNumber", "useDebounce", "useFormSubmit", "useInView"],
  },
  {
    id: "server" as const,
    icon: "🔌",
    name: "Server",
    package: "@m1kapp/kit/server",
    desc: "API 라우트용 서버 전용 유틸. 핸들러·응답 헬퍼·env 검증·재시도 fetch·LLM JSON 복구까지.",
    stats: [{ label: "헬퍼", value: 13 }, { label: "의존성", value: 0 }],
    requires: "Next.js / 서버 런타임",
    tags: ["handler", "ok", "requireEnv", "fetchWithRetry", "recoverJsonFromText", "scrapeOg"],
  },
  {
    id: "seo" as const,
    icon: "🔍",
    name: "SEO",
    package: "@m1kapp/kit/seo",
    desc: "Next.js 메타데이터·JSON-LD·sitemap·robots를 한 줄씩으로. 검색 노출 셋업 끝.",
    stats: [{ label: "헬퍼", value: 8 }, { label: "JSON-LD", value: 6 }],
    requires: "Next.js",
    tags: ["createMetadata", "jsonLd", "createSitemap", "createRobots", "nextSitemap"],
  },
];

function LibraryList({ onSelect }: { onSelect: (v: "ui" | "og" | "pwa" | "fetch" | "utils" | "server" | "seo") => void }) {
  return (
    <>
      <Section className="pt-5">
        <SectionHeader>라이브러리</SectionHeader>
        <div className="space-y-2">
          {LIBRARIES.map((lib) => (
            <button
              key={lib.id}
              onClick={() => onSelect(lib.id)}
              className="w-full text-left p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{lib.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{lib.name}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{lib.desc}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {lib.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRightIcon size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors flex-shrink-0 mt-1" />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-3">
                  {lib.stats.map((s) => (
                    <div key={s.label}>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{s.value}</span>
                      <span className="text-xs text-zinc-400 ml-1">{s.label}</span>
                    </div>
                  ))}
                </div>
                {lib.requires && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    필요 {lib.requires}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   Libraries Tab (list + detail)
══════════════════════════════════════════════ */
export function LibrariesTab({ themeColor }: {
  themeColor: string;
}) {
  const [detail, setDetail] = useState<"ui" | "og" | "pwa" | "fetch" | "utils" | "server" | "seo" | null>(null);

  const detailTitle = { ui: "UI", og: "OG Image", pwa: "PWA", fetch: "Fetch", utils: "Utils", server: "Server", seo: "SEO" };

  return (
    <>
      {/* Header override — back button when in detail */}
      {detail && (
        <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => setDetail(null)}
            className="-ml-1 p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <BackIcon />
          </button>
          <span className="font-black text-zinc-900 dark:text-white">{detailTitle[detail]}</span>
        </div>
      )}

      <div key={detail ?? "list"}>
        {!detail && <LibraryList onSelect={setDetail} />}
        {detail === "ui"    && <UIDetail themeColor={themeColor} />}
        {detail === "og"    && <OGDetail themeColor={themeColor} />}
        {detail === "pwa"   && <PWADetail themeColor={themeColor} />}
        {detail === "fetch" && <FetchDetail themeColor={themeColor} />}
        {detail === "utils" && <UtilsDetail themeColor={themeColor} />}
        {detail === "server" && <ServerDetail themeColor={themeColor} />}
        {detail === "seo"    && <SeoDetail themeColor={themeColor} />}
      </div>
    </>
  );
}
