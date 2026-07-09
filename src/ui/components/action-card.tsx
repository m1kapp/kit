import { type CSSProperties, type ReactNode } from "react";

export type ActionCardState = "pending" | "loading" | "done" | "cancelled";

export interface ActionCardLabels {
  /** Title shown while pending (defaults to `title`) */
  pending?: string;
  loading?: string;
  done?: string;
  cancelled?: string;
  confirm?: string;
  cancel?: string;
}

export interface ActionCardProps {
  /** Title shown in the pending state */
  title?: string;
  /** Lines of content (e.g. a proposed plan) */
  items?: ReactNode[];
  /** Free-form body rendered below items */
  children?: ReactNode;
  state?: ActionCardState;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Accent (any CSS color) for the pending border/title/confirm button. Defaults to `var(--kit-accent)`. */
  accent?: string;
  /** Override default Korean status labels */
  labels?: ActionCardLabels;
  className?: string;
}

/**
 * Inline confirm card for the "propose → confirm → execute" pattern (LLM tool
 * calls, etc.). Unlike `Dialog` it sits inside the message flow. Its color and
 * affordances change with `state`; action buttons show only while `pending`.
 *
 * @example
 * <ActionCard
 *   title="이렇게 기록해둘까요?"
 *   state={state}
 *   items={["🗓 6/4 15:00 디자인리뷰"]}
 *   onConfirm={commit}
 *   onCancel={cancel}
 * />
 */
export function ActionCard({
  title,
  items,
  children,
  state = "pending",
  onConfirm,
  onCancel,
  accent,
  labels,
  className = "",
}: ActionCardProps) {
  const accentColor = accent ?? "var(--kit-accent)";
  const loading = state === "loading";

  const l = {
    pending: title ?? "이렇게 진행할까요?",
    loading: "처리 중…",
    done: "완료됐어요",
    cancelled: "취소함",
    confirm: "확인",
    cancel: "취소",
    ...labels,
  };

  // 상태별 톤 — pending/loading은 accent(인라인 style), done/cancelled는 고정 톤
  const tones = {
    done: {
      container: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
      heading: "text-emerald-600 dark:text-emerald-400",
      item: "text-zinc-700 dark:text-zinc-200",
      accented: false,
      headingText: `✅ ${l.done}`,
    },
    cancelled: {
      container: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40",
      heading: "text-zinc-400 dark:text-zinc-500",
      item: "text-zinc-400 line-through dark:text-zinc-500",
      accented: false,
      headingText: `✖️ ${l.cancelled}`,
    },
    active: {
      container: "bg-white dark:bg-zinc-900",
      heading: "",
      item: "text-zinc-700 dark:text-zinc-200",
      accented: true,
      headingText: l.pending,
    },
  } as const;
  const tone = tones[state === "done" ? "done" : state === "cancelled" ? "cancelled" : "active"];

  const containerStyle: CSSProperties | undefined = tone.accented ? { borderColor: accentColor } : undefined;
  const headingStyle: CSSProperties | undefined = tone.accented ? { color: accentColor } : undefined;

  return (
    <div
      className={`max-w-[88%] self-start rounded-2xl border p-3 ${tone.container} ${className}`}
      style={containerStyle}
    >
      <div className={`mb-1.5 text-[11px] font-extrabold ${tone.heading}`} style={headingStyle}>
        {tone.headingText}
      </div>

      {items && items.length > 0 && (
        <div className="flex flex-col gap-1">
          {items.map((it, k) => (
            <div key={k} className={`text-[12.5px] leading-snug ${tone.item}`}>
              {it}
            </div>
          ))}
        </div>
      )}

      {children}

      {state === "pending" && (onConfirm || onCancel) && (
        <div className="mt-2.5 flex gap-2">
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl px-4 py-1.5 text-[13px] font-bold text-[var(--kit-accent-fg,#fff)]"
              style={{ backgroundColor: accentColor }}
            >
              {l.confirm}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-[13px] font-bold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {l.cancel}
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-2 text-[12px] text-zinc-400 dark:text-zinc-500">{l.loading}</div>
      )}
    </div>
  );
}
