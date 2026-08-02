import { useState } from "react";

const LANDING_COLOR = "#f59e0b";
export function LandingTemplate() {
  const C = LANDING_COLOR;
  const [sel, setSel] = useState<string | null>("pro");
  return (
    <div className="bg-white" style={{ ["--kit-accent" as string]: C } as React.CSSProperties}>
      {/* Hero — 헤드라인 극대화 */}
      <div className="px-6 pt-14 pb-10">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full" style={{ backgroundColor: C + "18", color: C }}>
          ✦ v1.0 출시
        </span>
        <h1 className="text-[3rem] font-black leading-[1.0] tracking-tight text-zinc-900 mt-5">
          아이디어를<br /><span style={{ color: C }}>제품으로.</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-4 leading-relaxed max-w-[260px]">
          설계부터 배포까지, @m1kapp/kit 하나로.
        </p>
        <div className="flex gap-3 mt-7">
          <button className="px-6 py-3 rounded-2xl text-sm font-black text-white shadow-lg" style={{ backgroundColor: C }}>
            무료로 시작
          </button>
          <button className="px-6 py-3 rounded-2xl text-sm font-semibold text-zinc-500 border border-zinc-200">
            데모 보기
          </button>
        </div>
        {/* 실측 없는 소셜프루프("이미 N명이 사용 중")는 넣지 않는다 — 지어낸
            숫자다. 진짜 지표가 생기면 그때 채운다. */}
      </div>

      {/* Features — 구분선 기반, 카드 없이 */}
      <div className="px-6 border-t border-zinc-100">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pt-7 mb-5">주요 기능</p>
        {[
          { icon: "⚡", title: "빠른 개발", desc: "50개+ 컴포넌트로 즉시 시작" },
          { icon: "📱", title: "PWA 내장",  desc: "앱 설치 유도까지 한 번에" },
          { icon: "🔍", title: "SEO 자동",  desc: "메타태그·사이트맵·JSON-LD" },
          { icon: "🎨", title: "테마 자유", desc: "다크모드·컬러 피커 내장" },
        ].map((f, i) => (
          <div key={f.title} className={`flex items-center gap-4 py-4 ${i < 3 ? "border-b border-zinc-100" : ""}`}>
            <span className="text-2xl w-8 shrink-0">{f.icon}</span>
            <div>
              <p className="text-sm font-black text-zinc-900">{f.title}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing — 인기 플랜 컬러 필 */}
      <div className="px-6 pt-8 pb-10 border-t border-zinc-100">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-5">요금제</p>
        <div className="space-y-3">
          {[
            { id: "free", name: "Free",  price: 0,     perks: ["프로젝트 1개", "기본 분석"],                 hot: false },
            { id: "pro",  name: "Pro",   price: 9900,  perks: ["프로젝트 무제한", "고급 분석", "우선 지원"], hot: true  },
            { id: "team", name: "Team",  price: 29900, perks: ["팀원 5명", "공유 대시보드"],                  hot: false },
          ].map((p) => (
            <button key={p.id} onClick={() => setSel(p.id)}
              className="w-full text-left p-5 rounded-2xl transition-all"
              style={p.hot ? { backgroundColor: C, color: "white" } : { backgroundColor: "#f9f9f9", border: `2px solid ${sel === p.id ? C : "transparent"}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-base font-black ${p.hot ? "text-white" : "text-zinc-900"}`}>{p.name}</p>
                    {p.hot && <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">인기</span>}
                  </div>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {p.perks.map(k => <span key={k} className={`text-[10px] ${p.hot ? "text-white/70" : "text-zinc-400"}`}>{k}</span>)}
                  </div>
                </div>
                <p className={`text-lg font-black tabular-nums shrink-0 ${p.hot ? "text-white" : "text-zinc-900"}`}>
                  {p.price === 0 ? "무료" : `₩${(p.price/1000).toFixed(0)}K`}
                  {p.price > 0 && <span className={`text-[10px] font-normal ml-0.5 ${p.hot ? "text-white/60" : "text-zinc-400"}`}>/월</span>}
                </p>
              </div>
            </button>
          ))}
        </div>
        <button className="mt-5 w-full py-4 rounded-2xl text-sm font-black text-white" style={{ backgroundColor: C }}>
          지금 시작하기 →
        </button>
        <p className="text-center text-[10px] text-zinc-400 mt-3">신용카드 불필요 · 언제든 해지</p>
      </div>
    </div>
  );
}
