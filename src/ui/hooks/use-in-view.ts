import { useState, useCallback, useRef } from "react";

export interface UseInViewOptions {
  /** 0–1, how much of the element must be visible (default: 0) */
  threshold?: number;
  /** Shrink/grow the root's bounding box (default: "0px") */
  rootMargin?: string;
  /** Only trigger once — stops observing after first intersection (default: false) */
  once?: boolean;
}

export interface UseInViewResult {
  /** Attach to the element you want to observe */
  ref: (node: Element | null) => void;
  inView: boolean;
}

/**
 * Observe whether an element is inside the viewport.
 * Common uses: infinite scroll trigger, lazy-load images, entrance animations.
 *
 * @example
 * const { ref, inView } = useInView({ threshold: 0.1, once: true });
 *
 * useEffect(() => {
 *   if (inView) fetchNextPage();
 * }, [inView]);
 *
 * <div ref={ref} />
 */
export function useInView(options: UseInViewOptions = {}): UseInViewResult {
  const { threshold = 0, rootMargin = "0px", once = false } = options;
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      // Disconnect previous observer
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting && once) {
            observerRef.current?.disconnect();
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(node);
    },
    [threshold, rootMargin, once]
  );

  return { ref, inView };
}
