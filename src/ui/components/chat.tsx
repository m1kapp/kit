import { type CSSProperties, type ReactNode } from "react";
import { formatDayLabel } from "../../utils";

export type ChatRole = "user" | "assistant";

export interface ChatBubbleProps {
  role: ChatRole;
  children: ReactNode;
  /** User-bubble background (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

/**
 * Chat message bubble. User messages align right with the accent color and a
 * tail on the bottom-right; assistant messages align left on a neutral surface.
 * Preserves newlines (`whitespace-pre-wrap`).
 *
 * @example
 * <ChatBubble role="user">오늘 3시 회의 잡아줘</ChatBubble>
 * <ChatBubble role="assistant">네, 잡아드릴게요.</ChatBubble>
 */
export function ChatBubble({ role, children, accent, className = "" }: ChatBubbleProps) {
  const mine = role === "user";
  const style: CSSProperties | undefined = mine
    ? { backgroundColor: accent ?? "var(--kit-accent)", color: "var(--kit-accent-fg, #fff)" }
    : undefined;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} ${className}`}>
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[14.5px] leading-relaxed rounded-2xl ${
          mine
            ? "rounded-br-md"
            : "rounded-bl-md bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
        style={style}
      >
        {children}
      </div>
    </div>
  );
}

export interface TypingIndicatorProps {
  className?: string;
}

/**
 * Three-dot "typing…" indicator on an assistant-style surface.
 *
 * @example
 * {pending && <TypingIndicator />}
 */
export function TypingIndicator({ className = "" }: TypingIndicatorProps) {
  return (
    <div className={`flex justify-start ${className}`}>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
            style={{ animation: "kit-typing-bounce 1.2s infinite", animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export interface ChatMessage {
  id?: string | number;
  role: ChatRole;
  content: ReactNode;
  /** Epoch ms — required for day dividers */
  timestamp?: number;
}

export interface MessageListProps {
  messages: ChatMessage[];
  /** Insert a date divider when the day changes between messages */
  dayDivider?: boolean;
  /** User-bubble accent (forwarded to each ChatBubble) */
  accent?: string;
  /** Format a divider label from a timestamp. Defaults to a Korean date label. */
  formatDay?: (ts: number) => string;
  /** Rendered after the last message — e.g. a <TypingIndicator /> */
  children?: ReactNode;
  className?: string;
}

function isSameDay(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="my-1 flex items-center gap-2.5 px-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
      <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

/**
 * Renders a vertical list of chat messages as bubbles, optionally inserting a
 * date divider when the calendar day changes (requires `timestamp` on messages).
 *
 * @example
 * <MessageList messages={msgs} dayDivider>
 *   {pending && <TypingIndicator />}
 * </MessageList>
 */
export function MessageList({
  messages,
  dayDivider = false,
  accent,
  formatDay = formatDayLabel,
  children,
  className = "",
}: MessageListProps) {
  let prevTs: number | undefined;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {messages.map((m, i) => {
        const showDivider =
          dayDivider && m.timestamp != null && (prevTs == null || !isSameDay(prevTs, m.timestamp));
        if (m.timestamp != null) prevTs = m.timestamp;
        return (
          <div key={m.id ?? i} className="contents">
            {showDivider && <DayDivider label={formatDay(m.timestamp!)} />}
            <ChatBubble role={m.role} accent={accent}>
              {m.content}
            </ChatBubble>
          </div>
        );
      })}
      {children}
    </div>
  );
}
