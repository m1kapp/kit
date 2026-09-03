"use client";

import type { ReactNode } from "react";
import { Dialog } from "./dialog";

export interface EvidenceDialogProps {
  open: boolean;
  onClose: () => void;
  /** 어느 항목의 근거인지 — 다이얼로그 제목. 예: "카카오 → SM" */
  heading?: string;
  /** 그 값 자체. 예: "인수금액 1.25조 원 · 지분 39.9%" */
  title: ReactNode;
  /** 원문에서 그 값이 나온 대목(인용). */
  quote?: ReactNode;
  /** 그 값을 그대로 믿기 전에 알아야 할 것. */
  note?: ReactNode;
  /** 원문 주소. */
  source?: string;
  /** 원문 링크 라벨. 기본: 그림이 있으면 "원문 ↗", 없으면 "그 값이 적힌 원문 ↗" */
  sourceLabel?: string;
  /** 그 값이 적힌 자리를 찍은 그림. */
  imageSrc?: string;
  imageAlt?: string;
  /** 그림도 주소도 없을 때 대신 보일 말. 기본: "원문 그림이 아직 없다" */
  emptyLabel?: string;
}

/**
 * 숫자 하나의 근거. 값을 눌렀을 때 인용문·캡처 그림·원문 링크가 뜬다.
 *
 * "이 숫자 어디서 왔나"를 화면에서 바로 보여 주는 증거 기반 앱들의 공통 골격 —
 * nlnn 의 값 다이얼로그, median-income-calc 의 정확도 안내가 전부 이 모양이었다.
 * 링크만 걸어 두면 원문이 바뀌거나 사라졌을 때 무엇을 보고 적었는지 알 길이
 * 없으므로, 그림(캡처)을 함께 두는 것을 권한다.
 */
export function EvidenceDialog({
  open,
  onClose,
  heading,
  title,
  quote,
  note,
  source,
  sourceLabel,
  imageSrc,
  imageAlt = "원문에서 그 값이 적힌 자리",
  emptyLabel = "원문 그림이 아직 없다",
}: EvidenceDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={heading} size={imageSrc ? "md" : "sm"}>
      <div className="text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">{title}</div>

      {imageSrc && (
        <div className="mt-2.5 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={imageAlt} loading="lazy" className="block h-auto w-full" />
        </div>
      )}

      {quote && (
        <div className="mt-2.5 border-l-2 border-zinc-200 pl-2.5 text-[11px] leading-relaxed text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {quote}
        </div>
      )}
      {note && <div className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{note}</div>}

      {source ? (
        <a
          href={source}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2.5 inline-block text-[11px] text-zinc-500 underline underline-offset-2 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {sourceLabel ?? (imageSrc ? "원문 ↗" : "그 값이 적힌 원문 ↗")}
        </a>
      ) : (
        !imageSrc && <div className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">{emptyLabel}</div>
      )}
    </Dialog>
  );
}
