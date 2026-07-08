"use client";

import { Fragment, type ReactNode } from "react";
import type { FetchStatus } from "../../fetch/use-fetch";

/** react-query 계열("pending")과 kit useFetch 계열("idle"/"loading") 상태를 모두 수용 */
export type AsyncListStatus = FetchStatus | "pending";

export interface AsyncListProps<T> {
  data: T[] | undefined;
  /** useFetch의 status를 그대로 넘기면 된다 */
  status: AsyncListStatus;
  error?: Error | null;
  renderItem: (item: T, index: number) => ReactNode;
  /** 로딩 중 반복 표시할 스켈레톤 한 개 */
  skeleton: ReactNode;
  skeletonCount?: number;
  emptyMessage?: string;
  /** 빈 상태 아래 렌더할 액션(버튼 등) */
  emptyAction?: ReactNode;
  className?: string;
}

/**
 * 비동기 목록의 4상태(로딩/에러/빈/성공)를 한 번에 처리하는 리스트.
 *
 * @example
 * const { data, status } = useFetch<Video[]>("/api/trend");
 * <AsyncList data={data} status={status} renderItem={(v) => <VideoRow key={v.id} video={v} />}
 *   skeleton={<VideoSkeleton />} skeletonCount={5} emptyMessage="영상이 없어요" />
 */
export function AsyncList<T>({
  data,
  status,
  error,
  renderItem,
  skeleton,
  skeletonCount = 3,
  emptyMessage = "데이터가 없습니다",
  emptyAction,
  className = "flex flex-col",
}: AsyncListProps<T>) {
  if (status === "error") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm text-zinc-400 dark:text-zinc-500">
        {error?.message || "오류가 발생했습니다"}
      </div>
    );
  }

  if (status === "pending" || status === "loading" || status === "idle") {
    return (
      <div className={className}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <Fragment key={i}>{skeleton}</Fragment>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-sm text-zinc-400 dark:text-zinc-500">
        <span>{emptyMessage}</span>
        {emptyAction}
      </div>
    );
  }

  return <div className={className}>{data.map((item, i) => renderItem(item, i))}</div>;
}
