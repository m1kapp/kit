import { useState, useEffect } from "react";
import { useLocalStorage, relativeTime, formatNumber, formatPrice } from "@m1kapp/kit";
import { ComponentCard, DemoInput, RegisterForm, ValueRow, timeSamples, useDebouncedSearch } from "../shared";

export function LocalStorageDemo() {
  const [count, setCount, removeCount] = useLocalStorage<number>("demo-count", 0);
  const [name, setName] = useLocalStorage<string>("demo-name", "");
  return (
    <ComponentCard
      name="useLocalStorage"
      desc="새로고침 후에도 유지되는 로컬 상태"
      code={`const [count, setCount, remove] = useLocalStorage("key", 0);\nsetCount(c => c + 1);\nremove(); // localStorage 삭제`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setCount((c) => c - 1)} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">−</button>
          <span className="flex-1 text-center text-lg font-bold text-zinc-800 dark:text-zinc-200">{count}</span>
          <button onClick={() => setCount((c) => c + 1)} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+</button>
          <button onClick={removeCount} className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2">초기화</button>
        </div>
        <DemoInput value={name} onChange={setName} placeholder="새로고침해도 남아요..." />
        <p className="text-[10px] text-zinc-400 font-mono">localStorage["demo-count"] = {count}, ["demo-name"] = "{name}"</p>
      </div>
    </ComponentCard>
  );
}

export function DebounceDemo({ themeColor }: { themeColor: string }) {
  const { input, setInput, debounced, callCount } = useDebouncedSearch();
  return (
    <ComponentCard
      name="useDebounce"
      desc="타이핑 멈출 때만 반응 — 검색창 필수"
      code={`const debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  if (debouncedQuery) search(debouncedQuery);\n}, [debouncedQuery]);`}
    >
      <div className="space-y-2">
        <DemoInput value={input} onChange={setInput} placeholder="타이핑해보세요..." />
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">실시간: <span className="text-zinc-600 dark:text-zinc-300">{input || "—"}</span></span>
          <span className="text-zinc-400">400ms 후: <span style={{ color: themeColor }}>{debounced || "—"}</span></span>
        </div>
        <p className="text-[10px] text-zinc-400">API 호출 횟수: {callCount}회 (타이핑마다 X → 멈출 때만 O)</p>
      </div>
    </ComponentCard>
  );
}

export function FormSubmitDemo({ themeColor }: { themeColor: string }) {
  return (
    <ComponentCard
      name="useFormSubmit"
      desc="loading / error / data — try/catch 없이"
      code={`const { submit, loading, error } = useFormSubmit(\n  async (url: string) => api.post("/api/sites", { url })\n);\n\n<form onSubmit={e => { e.preventDefault(); submit(input); }}>\n  <Button loading={loading}>등록</Button>\n  {error && <p>{error.message}</p>}\n</form>`}
    >
      <RegisterForm themeColor={themeColor} />
    </ComponentCard>
  );
}

export function UtilsDemo() {
  const samples = timeSamples().slice(0, 5);
  return (
    <ComponentCard
      name="relativeTime · formatNumber · formatPrice · cn"
      desc="순수 유틸 — 어디서나 import"
      code={`relativeTime(date)      // "3분 전"\nformatNumber(15_000)   // "1.5만"\nformatNumber(1_500_000)// "150만"\nformatPrice(9900)      // "₩9,900"\ncn("base", isOn && "active", err && "error")\ncn("px-2", "px-4")     // → "px-4" (Tailwind 충돌 해결)`}
    >
      <div className="space-y-2">
        <div className="rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {samples.map(s => (
            <ValueRow key={s.label} label={s.label} value={relativeTime(s.date)} boxed={false} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1500, 15_000, 150_000, 1_500_000].map(n => (
            <ValueRow key={n} label={n.toLocaleString()} value={formatNumber(n)} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[[9900, "KRW"], [9.99, "USD"]].map(([n, c]) => (
            <ValueRow key={String(c)} label={c} value={formatPrice(Number(n), String(c))} />
          ))}
        </div>
      </div>
    </ComponentCard>
  );
}
