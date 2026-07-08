"use client";

import { type ReactNode } from "react";

export interface MediaCardProps {
  /** 16:9 썸네일 이미지 URL */
  thumbnail: string;
  /** 썸네일 우하단 배지 (재생시간 등) */
  badge?: string;
  /** horizontal: 썸네일 좌측 절반 / vertical: 썸네일 상단 풀폭 */
  layout?: "horizontal" | "vertical";
  onClick?: () => void;
  /** 제목·메타 등 본문 — 폰트/색은 호출부 소유 */
  children: ReactNode;
  className?: string;
}

/**
 * 썸네일 + 본문 미디어 카드 (영상·플레이리스트 목록용).
 *
 * @example
 * <MediaCard thumbnail={v.thumbnail} badge={v.duration} onClick={open}>
 *   <p className="text-base line-clamp-2">{v.title}</p>
 *   <p className="text-xs text-zinc-400">조회수 {formatKoreanNumber(v.viewCount)}회</p>
 * </MediaCard>
 */
export function MediaCard({
  thumbnail,
  badge,
  layout = "horizontal",
  onClick,
  children,
  className = "",
}: MediaCardProps) {
  const isHorizontal = layout === "horizontal";
  return (
    <div
      className={`cursor-pointer ${isHorizontal ? "flex gap-4 py-2" : "flex flex-col gap-2"} ${className}`}
      onClick={onClick}
    >
      <div className={`relative overflow-hidden rounded-md shrink-0 ${isHorizontal ? "w-1/2" : "w-full"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnail} alt="" className="w-full object-cover" style={{ aspectRatio: "16 / 9" }} />
        {badge && (
          <div className="absolute bottom-2 right-2 bg-black/75 text-white rounded px-1 text-xs font-bold">
            {badge}
          </div>
        )}
      </div>
      <div className={isHorizontal ? "w-1/2 flex flex-col justify-center" : ""}>{children}</div>
    </div>
  );
}
