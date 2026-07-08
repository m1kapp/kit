"use client";

export interface UnderlineTab<T extends string = string> {
  id: T;
  label: string;
}

export interface UnderlineTabsProps<T extends string = string> {
  tabs: UnderlineTab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** 스크롤 상단 고정 */
  sticky?: boolean;
  /** 좁은 탭 간격 (요일 등 짧은 라벨 다수일 때) */
  compact?: boolean;
  /** 활성 탭 색. Default: currentColor 기반 (dark 셸에선 white) */
  activeColor?: string;
  className?: string;
}

/**
 * 하단 언더라인 인디케이터 탭 (콘텐츠 필터용) — 하단 내비 TabBar와 별개.
 * SegmentedControl(박스형)과 달리 미디어 앱의 카테고리 탭 UX.
 *
 * @example
 * <UnderlineTabs tabs={[{ id: "all", label: "전체" }, { id: "music", label: "음악" }]}
 *   active={tab} onChange={setTab} sticky />
 */
export function UnderlineTabs<T extends string>({
  tabs,
  active,
  onChange,
  sticky = false,
  compact = false,
  activeColor,
  className = "",
}: UnderlineTabsProps<T>) {
  return (
    <div
      className={`flex px-4 pt-2 overflow-x-auto scrollbar-hide border-b border-zinc-200 dark:border-white/20 ${
        compact ? "justify-between gap-2" : "gap-4"
      } ${sticky ? "sticky top-0 z-10 bg-white dark:bg-zinc-950" : ""} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-selected={isActive}
            className={`text-center cursor-pointer whitespace-nowrap border-b-2 -mb-px h-8 ${
              compact ? "min-w-8 px-1" : "min-w-12 px-1"
            } ${
              isActive
                ? "border-current font-semibold text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-400 dark:text-white/50"
            }`}
            style={isActive && activeColor ? { color: activeColor, borderColor: activeColor } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
