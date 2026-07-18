import { useRef, type CSSProperties, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./_icons";

export interface CarouselProps {
  /** Total number of slides */
  count: number;
  /** Active slide index (controlled) */
  index: number;
  onChange: (index: number) => void;
  /** Active slide content (the caller renders based on `index`) */
  children: ReactNode;
  /** Wrap around at the ends (default: true) */
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  /** Active dot color (any CSS color). Defaults to `var(--kit-accent)`. */
  accent?: string;
  className?: string;
}

/**
 * Swipeable carousel with dot indicators and prev/next arrows. Controlled —
 * you hold the index and render the active slide as children.
 *
 * @example
 * <Carousel count={items.length} index={i} onChange={setI}>
 *   <SlideView item={items[i]} />
 * </Carousel>
 */
export function Carousel({
  count,
  index,
  onChange,
  children,
  loop = true,
  showArrows = true,
  showDots = true,
  accent,
  className = "",
}: CarouselProps) {
  const touchStart = useRef({ x: 0, y: 0 });
  const accentColor = accent ?? "var(--kit-accent)";

  const go = (dir: -1 | 1) => {
    if (count === 0) return;
    let n = index + dir;
    if (loop) n = (n + count) % count;
    else n = Math.max(0, Math.min(count - 1, n));
    if (n !== index) onChange(n);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showDots && count > 1 && (
        <div className="flex items-center gap-1.5 py-2">
          {Array.from({ length: count }, (_, i) => {
            const active = i === index;
            const dotStyle: CSSProperties = {
              width: active ? 18 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: active ? accentColor : undefined,
            };
            return (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}`}
                onClick={() => onChange(i)}
                className={`transition-all duration-200 ${active ? "" : "bg-zinc-300 dark:bg-zinc-600"}`}
                style={dotStyle}
              />
            );
          })}
        </div>
      )}

      <div
        className="relative flex w-full items-center justify-center py-2"
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          if (!t) return;
          const dx = touchStart.current.x - t.clientX;
          const dy = touchStart.current.y - t.clientY;
          // Require a mostly-horizontal gesture — a vertical page scroll with
          // incidental horizontal drift shouldn't flip the slide.
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? 1 : -1);
        }}
      >
        {showArrows && count > 1 && (
          <button
            type="button"
            aria-label="이전"
            onClick={() => go(-1)}
            className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-100 bg-white text-zinc-400 shadow-sm transition-transform active:scale-90 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <ChevronLeftIcon size={16} />
          </button>
        )}
        <div className="min-w-0 flex-1 select-none px-12">{children}</div>
        {showArrows && count > 1 && (
          <button
            type="button"
            aria-label="다음"
            onClick={() => go(1)}
            className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-100 bg-white text-zinc-400 shadow-sm transition-transform active:scale-90 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <ChevronRightIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
