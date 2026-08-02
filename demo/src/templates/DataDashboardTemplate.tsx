import { useState } from "react";
import { SegmentedControl, BarList, ProgressRing } from "@m1kapp/kit";

const DASH_COLOR = "#06b6d4";
export function DataDashboardTemplate() {
  const C = DASH_COLOR;
  const [period, setPeriod] = useState<"7d" | "30d">("30d");
  return (
    <div className="bg-white" style={{ ["--kit-accent" as string]: C } as React.CSSProperties}>
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-end justify-between border-b border-zinc-100">
        <div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Analytics · 예시 데이터</p>
          <h1 className="text-2xl font-black text-zinc-900 mt-1 leading-none">대시보드</h1>
        </div>
        <SegmentedControl value={period} onChange={setPeriod} options={[{ value: "7d", label: "7일" }, { value: "30d", label: "30일" }]} />
      </div>

      {/* KPI — 숫자 극대화, 배경 없이. 증감률은 안 붙인다 — 진짜 측정 이력이
          없으면 "+18%" 같은 구체적 성장률은 실제 데이터인 척하는 거짓말이 된다.
          컴포넌트가 숫자를 어떻게 보여주는지는 이 값들만으로 충분히 보인다. */}
      <div className="grid grid-cols-2 border-b border-zinc-100">
        {[
          { label: "총 방문자", value: period === "30d" ? "12,450" : "3,210", c: C },
          { label: "신규 가입", value: period === "30d" ? "342"    : "89",     c: "#22c55e" },
          { label: "평균 체류", value: "2m 14s",                               c: "#f59e0b" },
          { label: "전환율",   value: "3.8%",                                  c: "#a855f7" },
        ].map((s, i) => (
          <div key={s.label} className={`px-6 py-5 ${i % 2 === 0 ? "border-r border-zinc-100" : ""} ${i < 2 ? "border-b border-zinc-100" : ""}`}>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-black mt-2 tabular-nums leading-none" style={{ color: s.c }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Page breakdown */}
      <div className="px-6 pt-7 pb-5 border-b border-zinc-100">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-5">페이지별 방문</p>
        <BarList items={[
          { label: "/홈",     value: 4820 },
          { label: "/상품",   value: 2341 },
          { label: "/빌더",   value: 1209 },
          { label: "/마이",   value: 743 },
          { label: "/클레임", value: 312 },
        ]} />
      </div>

      {/* Goal rings */}
      <div className="px-6 pt-7 pb-5 border-b border-zinc-100">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">월간 목표</p>
        <div className="flex justify-around">
          {[
            { label: "방문자", value: 12450, max: 15000, c: C },
            { label: "가입",   value: 342,   max: 500,   c: "#22c55e" },
            { label: "결제",   value: 28,    max: 50,    c: "#f59e0b" },
          ].map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <ProgressRing value={r.value} max={r.max} size={80} accent={r.c}>
                <span className="text-base font-black text-zinc-900">{Math.round(r.value / r.max * 100)}%</span>
              </ProgressRing>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{r.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="px-6 pt-7 pb-10">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-5">유입 경로</p>
        <div className="space-y-4">
          {[
            { src: "직접 접속",   pct: 42, c: C },
            { src: "X (Twitter)", pct: 28, c: "#ec4899" },
            { src: "Google",      pct: 18, c: "#f59e0b" },
            { src: "기타",        pct: 12, c: "#a1a1aa" },
          ].map((s) => (
            <div key={s.src} className="flex items-center gap-3">
              <p className="text-xs font-semibold text-zinc-600 w-20 shrink-0">{s.src}</p>
              <div className="flex-1 h-1 rounded-full bg-zinc-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.c }} />
              </div>
              <p className="text-xs font-black tabular-nums w-9 text-right" style={{ color: s.c }}>{s.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
