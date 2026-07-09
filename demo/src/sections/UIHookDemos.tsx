import { useState, useEffect } from "react";
import { useLocalStorage, useDebounce, useFormSubmit, relativeTime, formatNumber, formatPrice } from "@m1kapp/kit";
import { ComponentCard } from "../shared";

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
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새로고침해도 남아요..."
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
          style={{ fontSize: "16px" }}
        />
        <p className="text-[10px] text-zinc-400 font-mono">localStorage["demo-count"] = {count}, ["demo-name"] = "{name}"</p>
      </div>
    </ComponentCard>
  );
}

export function DebounceDemo({ themeColor }: { themeColor: string }) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 400);
  const [searchCount, setSearchCount] = useState(0);
  useEffect(() => {
    if (debounced) setSearchCount(c => c + 1);
  }, [debounced]);
  return (
    <ComponentCard
      name="useDebounce"
      desc="타이핑 멈출 때만 반응 — 검색창 필수"
      code={`const debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  if (debouncedQuery) search(debouncedQuery);\n}, [debouncedQuery]);`}
    >
      <div className="space-y-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="타이핑해보세요..."
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
          style={{ fontSize: "16px" }}
        />
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">실시간: <span className="text-zinc-600 dark:text-zinc-300">{input || "—"}</span></span>
          <span className="text-zinc-400">400ms 후: <span style={{ color: themeColor }}>{debounced || "—"}</span></span>
        </div>
        <p className="text-[10px] text-zinc-400">API 호출 횟수: {searchCount}회 (타이핑마다 X → 멈출 때만 O)</p>
      </div>
    </ComponentCard>
  );
}

export function FormSubmitDemo({ themeColor }: { themeColor: string }) {
  const [url, setUrl] = useState("");
  const { submit, loading, error, data, reset } = useFormSubmit(
    async (value: string) => {
      await new Promise(r => setTimeout(r, 1200));
      if (!value.startsWith("http")) throw new Error("URL은 http로 시작해야 해요");
      return { id: Math.random().toString(36).slice(2), url: value };
    }
  );
  return (
    <ComponentCard
      name="useFormSubmit"
      desc="loading / error / data — try/catch 없이"
      code={`const { submit, loading, error } = useFormSubmit(\n  async (url: string) => api.post("/api/sites", { url })\n);\n\n<form onSubmit={e => { e.preventDefault(); submit(input); }}>\n  <Button loading={loading}>등록</Button>\n  {error && <p>{error.message}</p>}\n</form>`}
    >
      <div className="space-y-2">
        {data ? (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">등록 완료!</p>
              <p className="text-[10px] text-green-600 dark:text-green-500 font-mono mt-0.5">{data.url}</p>
            </div>
            <button onClick={reset} className="text-[10px] text-green-600 dark:text-green-400 hover:underline">초기화</button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); submit(url); }} className="space-y-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
              style={{ fontSize: "16px" }}
            />
            {error && <p className="text-xs text-red-500">{error.message}</p>}
            <button
              type="submit"
              disabled={loading || !url}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              {loading ? "등록 중…" : "등록"}
            </button>
          </form>
        )}
      </div>
    </ComponentCard>
  );
}

export function UtilsDemo() {
  const now = new Date();
  const samples = [
    { label: "30초 전", date: new Date(now.getTime() - 30_000) },
    { label: "25분 전", date: new Date(now.getTime() - 25 * 60_000) },
    { label: "3시간 전", date: new Date(now.getTime() - 3 * 3600_000) },
    { label: "어제", date: new Date(now.getTime() - 30 * 3600_000) },
    { label: "5일 전", date: new Date(now.getTime() - 5 * 86400_000) },
  ];
  return (
    <ComponentCard
      name="relativeTime · formatNumber · formatPrice · cn"
      desc="순수 유틸 — 어디서나 import"
      code={`relativeTime(date)      // "3분 전"\nformatNumber(15_000)   // "1.5만"\nformatNumber(1_500_000)// "150만"\nformatPrice(9900)      // "₩9,900"\ncn("base", isOn && "active", err && "error")\ncn("px-2", "px-4")     // → "px-4" (Tailwind 충돌 해결)`}
    >
      <div className="space-y-2">
        <div className="rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {samples.map(s => (
            <div key={s.label} className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{s.label}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{relativeTime(s.date)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1500, 15_000, 150_000, 1_500_000].map(n => (
            <div key={n} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{n.toLocaleString()}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{formatNumber(n)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[[9900, "KRW"], [9.99, "USD"]].map(([n, c]) => (
            <div key={String(c)} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{c}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{formatPrice(Number(n), String(c))}</span>
            </div>
          ))}
        </div>
      </div>
    </ComponentCard>
  );
}
