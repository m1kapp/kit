import { useState } from "react";
import { colors } from "@m1kapp/kit";

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

export function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function RefreshIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg>;
}
