import {
  Section, SectionHeader, Divider,
  useInView,
  relativeTime, formatNumber, formatPrice,
} from "@m1kapp/kit";
import { CodeCard, DemoInput, RegisterForm, ValueRow, timeSamples, useDebouncedSearch, useTriggerCount } from "../shared";

/* ══════════════════════════════════════════════
   Utils Detail
══════════════════════════════════════════════ */
export function UtilsDetail({ themeColor }: { themeColor: string }) {
  const samples = timeSamples();
  const numSamples = [1_200, 15_000, 230_000, 1_500_000, 120_000_000];
  const priceSamples: [number, string][] = [[9_900, "KRW"], [49_000, "KRW"], [9.99, "USD"], [29.99, "USD"]];

  // useDebounce
  const { input, setInput, debounced, callCount } = useDebouncedSearch();

  // useInView
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });
  const inViewCount = useTriggerCount(inView);

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
          {samples.map(s => (
            <ValueRow key={s.label} label={s.label} value={relativeTime(s.date)} boxed={false} />
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
            <ValueRow key={n} label={n.toLocaleString()} value={formatNumber(n)} valueColor={themeColor} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {priceSamples.map(([n, c]) => (
            <ValueRow key={`${n}-${c}`} label={c} value={formatPrice(n, c)} />
          ))}
        </div>
        <CodeCard title="formatNumber · formatPrice" code={`formatNumber(15_000)      // "1.5만"\nformatNumber(1_500_000)   // "150만"\nformatPrice(9_900)         // "₩9,900"\nformatPrice(9.99, "USD")   // "$9.99"`} />
      </Section>

      <Divider />

      {/* useDebounce */}
      <Section>
        <SectionHeader>useDebounce</SectionHeader>
        <div className="space-y-3 mb-3">
          <DemoInput value={input} onChange={setInput} placeholder="검색어 입력..." />
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
          <RegisterForm themeColor={themeColor} />
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
