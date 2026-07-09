import { useState, useEffect } from "react";
import {
  Section, SectionHeader, Divider,
  useDebounce, useFormSubmit, useInView,
  relativeTime, formatNumber, formatPrice,
} from "@m1kapp/kit";
import { CodeCard } from "../shared";

/* ══════════════════════════════════════════════
   Utils Detail
══════════════════════════════════════════════ */
export function UtilsDetail({ themeColor }: { themeColor: string }) {
  const now = new Date();
  const timeSamples = [
    { label: "30초 전",  date: new Date(now.getTime() - 30_000) },
    { label: "25분 전",  date: new Date(now.getTime() - 25 * 60_000) },
    { label: "3시간 전", date: new Date(now.getTime() - 3 * 3_600_000) },
    { label: "어제",     date: new Date(now.getTime() - 30 * 3_600_000) },
    { label: "5일 전",   date: new Date(now.getTime() - 5 * 86_400_000) },
    { label: "3주 전",   date: new Date(now.getTime() - 21 * 86_400_000) },
  ];
  const numSamples = [1_200, 15_000, 230_000, 1_500_000, 120_000_000];
  const priceSamples: [number, string][] = [[9_900, "KRW"], [49_000, "KRW"], [9.99, "USD"], [29.99, "USD"]];

  // useDebounce
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 400);
  const [callCount, setCallCount] = useState(0);
  useEffect(() => { if (debounced) setCallCount(c => c + 1); }, [debounced]);

  // useFormSubmit
  const [url, setUrl] = useState("");
  const { submit, loading, error, data: submitData, reset } = useFormSubmit(
    async (value: string) => {
      await new Promise(r => setTimeout(r, 1200));
      if (!value.startsWith("http")) throw new Error("URL은 http로 시작해야 해요");
      return { id: Math.random().toString(36).slice(2), url: value };
    }
  );

  // useInView
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });
  const [inViewCount, setInViewCount] = useState(0);
  useEffect(() => { if (inView) setInViewCount(c => c + 1); }, [inView]);

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          순수 유틸 함수 + 범용 훅 모음. 의존성 제로 — 어디서나 import 해서 씁니다.
        </p>
      </Section>

      <Divider />

      {/* relativeTime */}
      <Section>
        <SectionHeader>relativeTime</SectionHeader>
        <div className="rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 mb-3">
          {timeSamples.map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900">
              <span className="text-xs text-zinc-400 font-mono">{s.label}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{relativeTime(s.date)}</span>
            </div>
          ))}
        </div>
        <CodeCard title="relativeTime" code={`import { relativeTime } from "@m1kapp/kit";\n\nrelativeTime(post.createdAt) // "3분 전"\nrelativeTime(new Date())     // "방금 전"`} />
      </Section>

      <Divider />

      {/* formatNumber / formatPrice */}
      <Section>
        <SectionHeader>formatNumber · formatPrice</SectionHeader>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {numSamples.map(n => (
            <div key={n} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{n.toLocaleString()}</span>
              <span className="text-sm font-bold" style={{ color: themeColor }}>{formatNumber(n)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {priceSamples.map(([n, c]) => (
            <div key={`${n}-${c}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{c}</span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatPrice(n, c)}</span>
            </div>
          ))}
        </div>
        <CodeCard title="formatNumber · formatPrice" code={`formatNumber(15_000)      // "1.5만"\nformatNumber(1_500_000)   // "150만"\nformatPrice(9_900)         // "₩9,900"\nformatPrice(9.99, "USD")   // "$9.99"`} />
      </Section>

      <Divider />

      {/* useDebounce */}
      <Section>
        <SectionHeader>useDebounce</SectionHeader>
        <div className="space-y-3 mb-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="검색어 입력..."
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
            style={{ fontSize: "16px" }}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <p className="text-[10px] text-zinc-400 mb-1">실시간 value</p>
              <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate">{input || "—"}</p>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <p className="text-[10px] text-zinc-400 mb-1">400ms 후 (API 호출)</p>
              <p className="text-sm font-mono truncate" style={{ color: themeColor }}>{debounced || "—"}</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">실제 API 호출 횟수: {callCount}회</p>
        </div>
        <CodeCard title="useDebounce" code={`const debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  if (debouncedQuery) search(debouncedQuery); // 멈출 때만 실행\n}, [debouncedQuery]);`} />
      </Section>

      <Divider />

      {/* useFormSubmit */}
      <Section>
        <SectionHeader>useFormSubmit</SectionHeader>
        <div className="space-y-3 mb-3">
          {submitData ? (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">등록 완료!</p>
                <p className="text-[10px] text-green-600 dark:text-green-500 font-mono mt-0.5">{submitData.url}</p>
              </div>
              <button onClick={reset} className="text-xs text-green-600 dark:text-green-400 hover:underline">초기화</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); submit(url); }} className="space-y-2">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
                style={{ fontSize: "16px" }}
              />
              {error && <p className="text-xs text-red-500 px-1">{error.message}</p>}
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                {loading ? "등록 중…" : "등록"}
              </button>
            </form>
          )}
        </div>
        <CodeCard title="useFormSubmit" code={`const { submit, loading, error } = useFormSubmit(\n  async (url: string) => api.post("/api/sites", { url }),\n  { onSuccess: () => router.push("/dashboard") }\n);\n\n// try/catch/finally/setLoading 전부 사라짐`} />
      </Section>

      <Divider />

      {/* useInView */}
      <Section>
        <SectionHeader>useInView</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          무한스크롤 트리거, 레이지 로드, 등장 애니메이션에 사용해요.
        </p>
        <div className="space-y-3 mb-3">
          <div className="h-32 overflow-y-auto rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 space-y-2">
            <p className="text-xs text-zinc-400">⬇ 스크롤 내리면 감지</p>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center px-3">
                <span className="text-xs text-zinc-500">아이템 {i + 1}</span>
              </div>
            ))}
            <div
              ref={inViewRef}
              className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-colors ${
                inView ? "text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
              }`}
              style={inView ? { backgroundColor: themeColor } : {}}
            >
              {inView ? "👁 감지됨!" : "센티넬 (여기가 보이면 트리거)"}
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">감지 횟수: {inViewCount}회</p>
        </div>
        <CodeCard title="useInView" code={`const { ref, inView } = useInView({ threshold: 0.1 });\n\nuseEffect(() => {\n  if (inView) fetchNextPage();\n}, [inView]);\n\n<div ref={ref} /> {/* 리스트 맨 아래 */}`} />
      </Section>

      <div className="pb-6" />
    </>
  );
}
