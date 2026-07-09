import type { KitStats } from "./credits-sheet";

const FEATURE_CHIP_STYLES = {
  component: { title: "컴포넌트", chip: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300" },
  hook: { title: "훅", chip: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800" },
  util: { title: "유틸리티", chip: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800" },
} as const;

function FeatureGroup({ category, stats }: { category: keyof typeof FEATURE_CHIP_STYLES; stats: KitStats }) {
  const items = stats.kit.features.filter((f) => f.category === category);
  if (items.length === 0) return null;
  const usage = stats.kit.usage[category];
  const { title, chip } = FEATURE_CHIP_STYLES[category];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{title}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {usage.used}/{usage.total}개 사용 ({usage.percent}%)
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((f) => (
          <span key={f.name} className={`text-sm font-mono px-3 py-1 rounded-full ${chip}`}>
            {f.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function KitStatsPanels({ stats }: { stats: KitStats }) {
  const totalIfNoKit = stats.source.codeLines + stats.kit.savedLines;
  return (
    <>
      {/* kit 없이 만들었다면 */}
      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">kit 없이 직접 만들었다면</p>
        <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          {totalIfNoKit.toLocaleString()}줄이 필요했을 거예요
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {stats.source.files}개 파일 · {stats.source.dir}/
        </p>
      </div>

      {/* Code savings */}
      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5">
        <p className="text-sm text-emerald-600 dark:text-emerald-500">
          그 중 <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.kit.savedPercent}%</span>를 kit이 대신 처리
        </p>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">내가 쓴 코드</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">{stats.source.codeLines.toLocaleString()}줄</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400">kit이 해준 코드</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-300">{stats.kit.savedLines.toLocaleString()}줄</span>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3 text-xs text-emerald-500 dark:text-emerald-600">
          <span>{stats.kit.savedKB}KB</span>
          <span>·</span>
          <span>A4 {stats.kit.savedA4}장 분량 절약</span>
        </div>
      </div>

      <FeatureGroup category="component" stats={stats} />
      <FeatureGroup category="hook" stats={stats} />
      <FeatureGroup category="util" stats={stats} />

      {/* 분석 시점 + 갱신 안내 (데이터가 있을 땐 '실행'이 아니라 '갱신') */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-300 dark:text-zinc-600">
        <span>분석: {new Date(stats.generatedAt).toLocaleDateString("ko-KR")}</span>
        <span aria-hidden>·</span>
        <span>갱신하려면</span>
        <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-500 dark:text-zinc-400">npx m1kkit stats</code>
      </div>
    </>
  );
}
