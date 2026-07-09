"use client";

import { useState, useEffect } from "react";
import { InAppSheet } from "./in-app-sheet";
import { fillDateSeries } from "../../utils";

// ─── 방문자 통계 시트 (카운터 클릭) ─────────────────────────────────────────

interface SiteStats {
  slug: string;
  title: string | null;
  today: number;
  weekly: number;
  monthly: number;
  total: number;
  progress: number;
  daily: { date: string; count: number }[];
  createdAt: string;
}

export function VisitorStatsSheet({ open, onClose, trackerHost, trackerSlug, sitePageUrl }: {
  open: boolean;
  onClose: () => void;
  trackerHost: string;
  trackerSlug: string | undefined;
  sitePageUrl: string;
}) {
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [error, setError] = useState(false);

  // 열릴 때 공개 통계(?view=public) fetch
  useEffect(() => {
    if (!open || !trackerSlug) return;
    let alive = true;
    setError(false);
    fetch(`https://${trackerHost}/api/sites/${encodeURIComponent(trackerSlug)}?view=public`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (alive) setSiteStats(d); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [open, trackerHost, trackerSlug]);

  return (
    <InAppSheet open={open} onClose={onClose} title="방문자 통계">
      <div className="px-5 pb-8 space-y-5 overflow-y-auto flex-1">
        {error && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">
            통계를 불러오지 못했어요. 아래 링크에서 확인해 주세요.
          </p>
        )}
        {!siteStats && !error && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">불러오는 중...</p>
        )}
        {siteStats && <VisitorStatsBody stats={siteStats} />}

        {/* 국가·기기·유입경로 등 풀 통계는 m1k.app에서 */}
        {sitePageUrl && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href={sitePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              전체 통계 보기 (국가·기기·유입경로) → m1k.app
            </a>
          </div>
        )}
      </div>
    </InAppSheet>
  );
}

function VisitorStatsBody({ stats }: { stats: SiteStats }) {
  const days = fillDateSeries(stats.daily, 30);
  const max = Math.max(...days.map((d) => d.count), 1);
  const chips: [string, number][] = [
    ["오늘", stats.today],
    ["최근 7일", stats.weekly],
    ["최근 30일", stats.monthly],
    ["누적", stats.total],
  ];
  return (
    <>
      {/* 요약 카운트 */}
      <div className="grid grid-cols-4 gap-2">
        {chips.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-2 py-3 text-center">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{label}</p>
            <p className="text-base font-bold tabular-nums text-zinc-800 dark:text-zinc-200">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 최근 30일 일별 차트 */}
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">최근 30일</p>
        <div className="flex items-end gap-[2px] h-20">
          {days.map((d) => (
            <div
              key={d.date}
              title={`${d.date} · ${d.count.toLocaleString()}`}
              className="flex-1 rounded-t-sm bg-[var(--kit-accent,#18181b)]"
              style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 1.5)}%`, opacity: d.count > 0 ? 0.85 : 0.25 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-zinc-300 dark:text-zinc-600 tabular-nums">
          <span>{days[0]?.date.slice(5)}</span>
          <span>{days[days.length - 1]?.date.slice(5)}</span>
        </div>
      </div>

      {/* 1k 진행률 */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-zinc-500 dark:text-zinc-400">make 1k</span>
          <span className="font-mono text-zinc-600 dark:text-zinc-300">{Math.round(stats.progress * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full bg-[var(--kit-accent,#18181b)]" style={{ width: `${stats.progress * 100}%` }} />
        </div>
      </div>
    </>
  );
}
