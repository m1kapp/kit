/* Bio */
const BIO_COLOR = "#8b5cf6";
export function BioTemplate() {
  const C = BIO_COLOR;
  return (
    <div className="bg-white" style={{ ["--kit-accent" as string]: C } as React.CSSProperties}>
      {/* Hero — color header strip */}
      <div className="relative px-6 pt-12 pb-10 text-center" style={{ backgroundColor: C + "0c" }}>
        <div className="w-20 h-20 rounded-full p-[3px] mx-auto" style={{ background: `linear-gradient(135deg, ${C}, #ec4899)` }}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-black" style={{ color: C }}>M</div>
        </div>
        {/* 이름 극대화 */}
        <h1 className="text-[2.6rem] font-black mt-5 leading-none tracking-tight text-zinc-900">Minho<br />Yoo</h1>
        <p className="text-xs font-semibold mt-3 uppercase tracking-[0.15em]" style={{ color: C }}>풀스택 · 사이드프로젝트 메이커</p>
        {/* 스킬 — 점 구분자로 미니멀하게 */}
        <p className="text-[11px] text-zinc-400 mt-4 tracking-wide">React · Next.js · TypeScript · Tailwind</p>
      </div>

      {/* Links — 컬러 하이라이트 하나만 */}
      <div className="px-5 pt-6 space-y-2.5">
        {[
          { icon: "💻", label: "GitHub", sub: "github.com/m1kapp" },
          { icon: "𝕏",  label: "X (Twitter)", sub: "@m1kapp" },
          { icon: "✉️", label: "이메일", sub: "wingedcompany@gmail.com" },
        ].map((l) => (
          <button key={l.label} className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-left hover:bg-zinc-100 active:scale-[0.99] transition-all">
            <span className="text-lg">{l.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-800">{l.label}</p>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5">{l.sub}</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
        {/* 메인 링크만 컬러 필 */}
        <button className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left active:scale-[0.99] transition-all text-white" style={{ background: `linear-gradient(135deg, ${C}, #7c3aed)` }}>
          <span className="text-lg">📊</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">m1k.app</p>
            <p className="text-[10px] opacity-60 mt-0.5">방문자 트래커 서비스</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Projects — 왼쪽 컬러바로 카드 다양화 */}
      <div className="px-5 pt-8 pb-10">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">프로젝트</p>
        <div className="space-y-3">
          {[
            { name: "m1k.app", desc: "방문자 1,000명을 향한 여정", badge: "LIVE", c: C },
            { name: "LLMRace", desc: "LLM 출시 레이스 D-day 예측", badge: "LIVE", c: "#ec4899" },
            { name: "@m1kapp/kit", desc: "사이드 프로젝트 React UI 킷", badge: "OSS", c: "#22c55e" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
              <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: p.c }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-zinc-900">{p.name}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: p.c + "15", color: p.c }}>{p.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
