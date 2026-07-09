import { useState, useEffect } from "react";
import { Section, Divider, Typewriter, formatNumber } from "@m1kapp/kit";
import { HomeQuickStart } from "./HomeQuickStart";

declare const __PKG_VERSION__: string;

/* ══════════════════════════════════════════════
   Home Tab
══════════════════════════════════════════════ */
export function HomeTab({ themeColor, onGoToLibraries }: { themeColor: string; onGoToLibraries: () => void }) {
  const [copied, setCopied] = useState(false);
  const [weeklyDl, setWeeklyDl] = useState<number | null>(null);

  useEffect(() => {
    // npm 공개 API — 교차출처 허용. 주간 다운로드 라이브.
    fetch("https://api.npmjs.org/downloads/point/last-week/@m1kapp/kit")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.downloads === "number") setWeeklyDl(d.downloads); })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <Section className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: themeColor }}>
            v{__PKG_VERSION__}
          </span>
          <span className="text-[10px] font-semibold text-zinc-400">zero dependencies</span>
        </div>

        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          사이드 프로젝트를<br />
          <span style={{ color: themeColor }}>빠르게 완성</span>하는<br />
          UI 킷
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
          AppShell부터 OG 이미지, PWA, SEO까지.<br />
          패키지 하나로 전부 해결합니다.
        </p>

        <p className="text-base mt-4 min-h-6 font-semibold">
          <Typewriter
            words={["바이브코딩 프로젝트", "주말 토이 프로젝트", "해커톤 서비스", "1인 스타트업"]}
            color={themeColor}
          />
          <span className="text-zinc-400 dark:text-zinc-500 font-normal">에 최적화</span>
        </p>
      </Section>

      {/* ── GitHub / npm (맨 위 퀵 링크) ── */}
      <Section className="mt-3">
        <div className="flex gap-2">
          <a
            href="https://github.com/m1kapp/kit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-xs font-semibold text-white hover:opacity-80 transition-opacity ring-1 ring-white/10 flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@m1kapp/kit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-2xl text-xs font-semibold text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5"
            style={{ backgroundColor: themeColor }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/></svg>
            npm
          </a>
        </div>
      </Section>

      <HomeQuickStart themeColor={themeColor} />

      <Divider />

      {/* ── Why ── */}
      <Section>
        <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900 dark:text-white">왜 @m1kapp/kit?</h2>
        <div className="space-y-2">
          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ),
              title: "의존성 0",
              desc: "React 외엔 아무것도 없어요. node_modules 지옥 없이 그냥 씁니다.",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              ),
              title: "모바일 퍼스트 AppShell",
              desc: "네이티브 앱처럼 보이는 AppShell + TabBar. PWA에 최적화.",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              ),
              title: "하나로 다 됩니다",
              desc: "UI · OG · PWA · SEO · Fetch · Utils. 패키지 하나면 충분.",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/></svg>
              ),
              title: "SSR 완벽 지원",
              desc: "Next.js App Router에서 그대로 import. 서버 컴포넌트와 충돌 없음.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-zinc-600 dark:text-zinc-400" style={{ backgroundColor: `${themeColor}18` }}>
                <span style={{ color: themeColor }}>{icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── Modules ── */}
      <Section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">포함된 모듈</p>
          <button
            onClick={onGoToLibraries}
            className="text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: themeColor }}
          >
            전체 보기 →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "🧩", label: "UI",       count: "45 컴포넌트", desc: "AppShell · TabBar · Chat" },
            { icon: "🔌", label: "Server",   count: "13 헬퍼",    desc: "handler · requireEnv · fetchRetry" },
            { icon: "🌐", label: "Fetch",    count: "2 훅",       desc: "useFetch · usePolling" },
            { icon: "🖼",  label: "OG Image", count: "7 템플릿",   desc: "Next.js OG 이미지 생성기" },
            { icon: "📱",  label: "PWA",      count: "5 유틸",     desc: "manifest · 설치 유도" },
            { icon: "🛠",  label: "Utils",    count: "14 훅·유틸", desc: "format · cn · groupByDay" },
            { icon: "🔍", label: "SEO",      count: "8 헬퍼",     desc: "metadata · jsonLd · sitemap" },
          ].map(({ icon, label, count, desc }) => (
            <button
              key={label}
              onClick={onGoToLibraries}
              className="text-left p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98]"
            >
              <span className="text-xl">{icon}</span>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2">{label}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: themeColor }}>{count}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{desc}</p>
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── Stats ── */}
      <Section>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: weeklyDl == null ? "—" : formatNumber(weeklyDl), label: "주간 다운로드" },
            { value: "45+", label: "컴포넌트" },
            { value: "0",   label: "의존성" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
              <span className="text-2xl font-black text-zinc-900 dark:text-white" style={value === "0" ? { color: themeColor } : {}}>{value}</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}
