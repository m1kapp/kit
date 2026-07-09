"use client";

import { useState, useEffect } from "react";
import { InAppSheet } from "./in-app-sheet";
import { KitStatsPanels } from "./kit-stats-panels";

// ─── 크레딧 시트 (powered-by 클릭) ──────────────────────────────────────────

export interface UsageInfo {
  used: number;
  total: number;
  percent: number;
}

export interface KitStats {
  generatedAt: string;
  kitVersion: string;
  source: {
    dir: string;
    files: number;
    totalLines: number;
    codeLines: number;
  };
  kit: {
    features: { name: string; loc: number; category: string }[];
    savedLines: number;
    savedKB: number;
    savedA4: number;
    savedPercent: number;
    usage: {
      component: UsageInfo;
      hook: UsageInfo;
      util: UsageInfo;
    };
  };
}

export function CreditsSheet({ open, onClose, ver, tracking, claimed, statsUrl }: {
  open: boolean;
  onClose: () => void;
  ver: string;
  tracking: boolean;
  claimed: boolean;
  statsUrl: string;
}) {
  const [stats, setStats] = useState<KitStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || stats || loading || error) return;
    setLoading(true);
    fetch(statsUrl)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open, stats, loading, error, statsUrl]);

  return (
    <InAppSheet open={open} onClose={onClose} title="@m1kapp/kit" fullHeight>
      <div className="px-5 pb-8 space-y-6 overflow-y-auto flex-1">
        {/* Version */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            v{ver}
          </span>
          <span className="text-sm text-zinc-400 dark:text-zinc-500">
            사이드 프로젝트를 위한 UI · SEO · PWA 킷
          </span>
        </div>

        {/* Visitor-tracker status */}
        {tracking && <TrackerStatusCard claimed={claimed} />}

        {loading && (
          <div className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
            코드 분석 결과를 불러오는 중...
          </div>
        )}

        {error && <StatsSetupGuide />}

        {stats && <KitStatsPanels stats={stats} />}

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <a
            href="https://github.com/m1kapp/kit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            github.com/m1kapp/kit →
          </a>
        </div>
      </div>
    </InAppSheet>
  );
}

function TrackerStatusCard({ claimed }: { claimed: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${
      claimed
        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
    }`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${claimed ? "bg-emerald-500" : "bg-amber-500"}`} />
        <p className={`text-sm font-semibold ${claimed ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
          방문자 추적 연결됨 · {claimed ? "인증됨" : "아직 미인증"}
        </p>
      </div>
      {!claimed && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            이 사이트는 추적이 붙었지만 아직 내 계정에 귀속(인증)되지 않았어요.
          </p>
          <code className="block rounded-lg bg-zinc-900 dark:bg-zinc-950 px-3 py-2 text-xs text-emerald-400 font-mono">npx m1kkit claim</code>
        </div>
      )}
    </div>
  );
}

function StatsSetupGuide() {
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          코드 분석 데이터가 아직 없어요
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          아래 명령어를 한 번 실행하면 이 화면에 프로젝트 분석 결과가 표시됩니다.
        </p>
      </div>

      <div className="rounded-lg bg-zinc-900 dark:bg-zinc-950 p-3">
        <code className="text-xs text-emerald-400 font-mono">npx m1kkit stats</code>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          매번 자동으로 하려면 package.json에 추가:
        </p>
        <div className="rounded-lg bg-zinc-900 dark:bg-zinc-950 p-3 space-y-1">
          <p className="text-[11px] text-zinc-400 font-mono">
            {'"dev": "m1kkit stats && next dev"'}
          </p>
          <p className="text-[11px] text-zinc-400 font-mono">
            {'"build": "m1kkit stats && next build"'}
          </p>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          next 대신 vite, remix 등 본인 프레임워크로 바꾸세요.
        </p>
      </div>
    </div>
  );
}
