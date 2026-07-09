import { useState, useEffect } from "react";
import { Section, SectionHeader } from "@m1kapp/kit";
import { BackIcon } from "../shared";
import { BioTemplate } from "../templates/BioTemplate";
import { LandingTemplate } from "../templates/LandingTemplate";
import { DataDashboardTemplate } from "../templates/DataDashboardTemplate";

/* ══════════════════════════════════════════════
   Templates Tab
══════════════════════════════════════════════ */
const TEMPLATE_LIST = [
  { id: "bio",       icon: "🪪", name: "개인 Bio",      desc: "링크트리 스타일 · 소개 · 프로젝트 · SNS" },
  { id: "landing",   icon: "🛍", name: "랜딩 / 쇼핑몰", desc: "히어로 · 기능 목록 · 상품 카드 · CTA" },
  { id: "dashboard", icon: "📊", name: "데이터 대시보드", desc: "KPI · BarList · ProgressRing · 필터" },
] as const;
type TemplateId = typeof TEMPLATE_LIST[number]["id"];

export function TemplatesTab({ themeColor }: { themeColor: string }) {
  const [active, setActive] = useState<TemplateId | null>(null);
  const current = TEMPLATE_LIST.find((t) => t.id === active);

  useEffect(() => {
    const html = document.documentElement;
    if (active) {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
    return () => { html.classList.add("dark"); };
  }, [active]);
  return (
    <>
      {active && (
        <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900">
          <button onClick={() => setActive(null)} className="-ml-1 p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <BackIcon />
          </button>
          <span className="font-black text-zinc-900 dark:text-white">{current?.icon} {current?.name}</span>
        </div>
      )}
      <div key={active ?? "list"}>
        {!active && (
          <Section className="pt-5">
            <SectionHeader>앱 템플릿</SectionHeader>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 leading-relaxed">
              kit 컴포넌트로 만든 보편적인 화면 패턴. 그대로 복사해서 쓰세요.
            </p>
            <div className="space-y-2">
              {TEMPLATE_LIST.map((t) => (
                <button key={t.id} onClick={() => setActive(t.id)} className="w-full text-left p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all group flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{t.desc}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>
          </Section>
        )}
        {active === "bio"       && <BioTemplate />}
        {active === "landing"   && <LandingTemplate />}
        {active === "dashboard" && <DataDashboardTemplate />}
      </div>
    </>
  );
}
