"use client";

import React, { useState } from "react";
import { useImageLoader } from "./img";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "rounded";

export interface AvatarProps {
  src?: string;
  /**
   * 순서대로 시도할 후보 URL 목록. 첫 장이 죽으면 다음 장으로 넘어가고,
   * 전부 실패해야 이니셜 폴백이 뜬다. src 보다 우선한다.
   */
  candidates?: string[];
  fallback: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  color?: string;
  /** 그라데이션 링. 프로필·계정 아바타를 눈에 띄게 세울 때. */
  ring?: boolean;
  className?: string;
}

const sizes: Record<AvatarSize, { box: string; text: string; px: number }> = {
  xs: { box: "w-6 h-6",   text: "text-[9px]",  px: 24 },
  sm: { box: "w-8 h-8",   text: "text-[11px]", px: 32 },
  md: { box: "w-10 h-10", text: "text-sm",      px: 40 },
  lg: { box: "w-14 h-14", text: "text-lg",      px: 56 },
  xl: { box: "w-20 h-20", text: "text-2xl",     px: 80 },
};

const RING_GRADIENT = "linear-gradient(135deg, #f9a825, #f06292, #ab47bc, #5c6bc0)";

function initialsOf(fallback: string): string {
  const trimmed = fallback.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  return trimmed.length === 0
    ? "?"
    : (words.length >= 2 ? words[0][0] + words[1][0] : trimmed.slice(0, 2)).toUpperCase();
}

/** 후보 URL 을 차례로 시도하고, 로딩 중엔 빈 테두리·전부 실패하면 이니셜을 그린다. */
function MultiSourcePhoto({ urls, fallback, radius, text, color }: {
  urls: string[]; fallback: string; radius: string; text: string; color: string;
}) {
  const { status, url, refCallback, handleLoad, handleError } = useImageLoader(urls);
  return (
    <div className={`relative h-full w-full overflow-hidden ${radius}`}>
      {status === "failed" ? (
        <div
          className={`absolute inset-0 flex select-none items-center justify-center font-bold ${radius} ${text}`}
          style={{ backgroundColor: color, color: "#ffffff" }}
        >
          {initialsOf(fallback)}
        </div>
      ) : status === "loading" ? (
        <div className={`absolute inset-0 border border-zinc-200 dark:border-zinc-700 ${radius}`} />
      ) : null}
      {url && (
        <img
          key={url}
          ref={refCallback}
          src={url}
          alt={fallback}
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${radius} ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

export function Avatar({
  src,
  candidates,
  fallback,
  size = "md",
  shape = "circle",
  color = "#3f3f46",
  ring = false,
  className = "",
}: AvatarProps) {
  const { box, text } = sizes[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  const [imgError, setImgError] = useState(false);

  const urls = candidates?.length ? candidates : [];

  let body: React.ReactNode;
  if (urls.length > 0) {
    body = (
      <div className={`${box} flex-shrink-0 overflow-hidden ${radius} ${ring ? "" : className}`}>
        <MultiSourcePhoto urls={urls} fallback={fallback} radius={radius} text={text} color={color} />
      </div>
    );
  } else if (src && !imgError) {
    body = (
      <img
        src={src}
        alt={fallback}
        onError={() => setImgError(true)}
        className={`${box} ${radius} flex-shrink-0 object-cover ${ring ? "" : className}`}
      />
    );
  } else {
    body = (
      <div
        className={`${box} ${radius} flex flex-shrink-0 select-none items-center justify-center font-bold ${text} ${ring ? "" : className}`}
        style={{ backgroundColor: color, color: "#ffffff" }}
        aria-label={fallback}
      >
        {initialsOf(fallback)}
      </div>
    );
  }

  if (!ring) return <>{body}</>;

  // 링은 아바타를 2px 감싼다 — 사진 크기(size)는 그대로 두고 바깥으로 자란다.
  return (
    <div className={`flex-shrink-0 rounded-full p-[2.5px] ${className}`} style={{ background: RING_GRADIENT }}>
      <div className="rounded-full bg-white p-[2px] dark:bg-zinc-900">{body}</div>
    </div>
  );
}
