import { useState, useEffect } from "react";
import { colors, useDebounce, useFormSubmit } from "@m1kapp/kit";

/* ══════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════ */
function makeGrassData() {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    data.push({ date: key, count: Math.random() > 0.55 ? Math.floor(Math.random() * 80) + 1 : 0 });
  }
  return data;
}
export const GRASS_DATA = makeGrassData();
/** relativeTime 데모용 상대시간 샘플 (렌더 시점 기준) */
export function timeSamples() {
  const now = Date.now();
  return [
    { label: "30초 전",  date: new Date(now - 30_000) },
    { label: "25분 전",  date: new Date(now - 25 * 60_000) },
    { label: "3시간 전", date: new Date(now - 3 * 3_600_000) },
    { label: "어제",     date: new Date(now - 30 * 3_600_000) },
    { label: "5일 전",   date: new Date(now - 5 * 86_400_000) },
    { label: "3주 전",   date: new Date(now - 21 * 86_400_000) },
  ];
}

export const ALL_COLORS = Object.entries(colors).map(([name, color]) => ({ name, color }));

/* ══════════════════════════════════════════════
   Shared UI pieces
══════════════════════════════════════════════ */
export function ComponentCard({ name, desc, code, children }: {
  name: string; desc: string; code: string; children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-mono">{"<"}{name}{" />"}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
      </div>
      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800">{children}</div>
      <button
        onClick={() => setShowCode(!showCode)}
        className="w-full px-3 py-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
      >
        {showCode ? "코드 숨기기" : "코드 보기"}
      </button>
      {showCode && (
        <pre className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 overflow-x-auto leading-relaxed bg-zinc-100 dark:bg-zinc-950">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export function CodeCard({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-mono">{title}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="px-3 py-3 text-[11px] text-zinc-600 dark:text-zinc-400 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Icons — stroke 아이콘 공통 래퍼
══════════════════════════════════════════════ */
export function LineIcon({ size = 20, weight = 2, className, children }: {
  size?: number; weight?: number; className?: string; children: React.ReactNode;
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={weight}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

type IconProps = { size?: number; className?: string };

export function BackIcon({ size = 20, className }: IconProps) {
  return <LineIcon size={size} weight={2.5} className={className}><polyline points="15 18 9 12 15 6" /></LineIcon>;
}

export function RefreshIcon({ size = 18, className }: IconProps) {
  return <LineIcon size={size} className={className}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></LineIcon>;
}

export function CheckIcon({ size = 14, className }: IconProps) {
  return <LineIcon size={size} weight={2.5} className={className}><polyline points="20 6 9 17 4 12" /></LineIcon>;
}

export function ChevronRightIcon({ size = 16, className }: IconProps) {
  return <LineIcon size={size} weight={2.5} className={className}><polyline points="9 18 15 12 9 6" /></LineIcon>;
}

export function HomeIcon({ size = 20, className }: IconProps) {
  return <LineIcon size={size} className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></LineIcon>;
}

/* ══════════════════════════════════════════════
   Demo primitives — 데모 전반에서 반복되는 조각
══════════════════════════════════════════════ */
export function DemoInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
      style={{ fontSize: "16px" }}
    />
  );
}

/** 좌측 라벨 + 우측 값 한 줄. divide 리스트/그리드 양쪽에서 재사용 */
export function ValueRow({ label, value, valueColor, boxed = true }: {
  label: React.ReactNode; value: React.ReactNode; valueColor?: string; boxed?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 ${boxed ? "rounded-xl" : ""}`}>
      <span className="text-[10px] text-zinc-400 font-mono">{label}</span>
      <span
        className={`text-xs font-semibold ${valueColor ? "" : "text-zinc-700 dark:text-zinc-300"}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/** 값이 truthy로 바뀔 때마다 증가 — "몇 번 호출됐나" 계측용 */
export function useTriggerCount(value: unknown) {
  const [count, setCount] = useState(0);
  useEffect(() => { if (value) setCount(c => c + 1); }, [value]);
  return count;
}

/** 디바운스 검색 데모 상태 한 벌 (입력값 + 디바운스된 값 + 실제 호출 횟수) */
export function useDebouncedSearch(delay = 400) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, delay);
  return { input, setInput, debounced, callCount: useTriggerCount(debounced) };
}

export function RegisterSuccess({ url, onReset }: { url: string; onReset: () => void }) {
  return (
    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-green-700 dark:text-green-400">등록 완료!</p>
        <p className="text-[10px] text-green-600 dark:text-green-500 font-mono mt-0.5">{url}</p>
      </div>
      <button onClick={onReset} className="text-[10px] text-green-600 dark:text-green-400 hover:underline">초기화</button>
    </div>
  );
}

/** useFormSubmit 데모 폼 한 벌 — 성공 시 결과 패널, 아니면 입력 폼 */
export function RegisterForm({ themeColor }: { themeColor: string }) {
  const [url, setUrl] = useState("");
  const { submit, loading, error, data, reset } = useFormSubmit(mockRegister);
  if (data) return <RegisterSuccess url={data.url} onReset={reset} />;
  return (
    <form onSubmit={e => { e.preventDefault(); submit(url); }} className="space-y-2">
      <DemoInput value={url} onChange={setUrl} placeholder="https://example.com" />
      {error && <p className="text-xs text-red-500 px-1">{error.message}</p>}
      <SubmitButton loading={loading} disabled={loading || !url} themeColor={themeColor} />
    </form>
  );
}

export function SubmitButton({ loading, disabled, themeColor }: {
  loading: boolean; disabled: boolean; themeColor: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
      style={{ backgroundColor: themeColor }}
    >
      {loading ? "등록 중…" : "등록"}
    </button>
  );
}

/** 데모용 가짜 서버 등록 — 1.2초 지연 후 http 검증 */
export async function mockRegister(value: string) {
  await new Promise(r => setTimeout(r, 1200));
  if (!value.startsWith("http")) throw new Error("URL은 http로 시작해야 해요");
  return { id: Math.random().toString(36).slice(2), url: value };
}
