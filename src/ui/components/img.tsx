import { useState, useCallback, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";

type ImgStatus = "loading" | "loaded" | "failed";

/**
 * Tries an ordered list of image URLs, falling back to the next on error or
 * when an image loads too small/broken. Handles already-cached images.
 * Returns props to spread onto an `<img>`.
 *
 * @example
 * const { status, url, refCallback, handleLoad, handleError } = useImageLoader([a, b]);
 * if (status === "failed") return <Fallback />;
 * return <img ref={refCallback} src={url!} onLoad={handleLoad} onError={handleError} />;
 */
export function useImageLoader(urls: string[]) {
  const key = urls.join("\0");
  const [state, setState] = useState<{ idx: number; status: ImgStatus; _key: string }>(() => ({
    idx: 0,
    status: urls.length > 0 ? "loading" : "failed",
    _key: key,
  }));

  // reset during render when the URL list changes (avoids ref-callback races)
  if (state._key !== key) {
    setState({ idx: 0, status: urls.length > 0 ? "loading" : "failed", _key: key });
  }

  const url = state.idx < urls.length ? urls[state.idx] : null;

  function tryNext() {
    setState((prev) => {
      if (prev.status !== "loading") return prev;
      const next = prev.idx + 1;
      return { ...prev, idx: next, status: next < urls.length ? "loading" : "failed" };
    });
  }
  function markLoaded() {
    setState((prev) => (prev.status === "loading" ? { ...prev, status: "loaded" } : prev));
  }
  function handleLoad(e: SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (img.naturalWidth >= 8 && img.naturalHeight >= 8) markLoaded();
    else tryNext();
  }
  const refCallback = useCallback(
    (el: HTMLImageElement | null) => {
      if (el && el.complete) {
        if (el.naturalWidth >= 8 && el.naturalHeight >= 8) markLoaded();
        else tryNext();
      }
    },
    [url],
  );

  return {
    status: url ? state.status : ("failed" as const),
    url,
    refCallback,
    handleLoad,
    handleError: tryNext,
  };
}

export interface ImgProps {
  /** Single source, or use `candidates` for ordered fallback */
  src?: string | null;
  /** Ordered candidate URLs; first one that loads wins */
  candidates?: string[];
  /** Shown when all sources fail (or none given) */
  fallback?: ReactNode;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * `<img>` with multi-URL fallback and a render fallback when every source fails.
 *
 * @example
 * <Img candidates={[avatarUrl, gravatar]} fallback={<Avatar fallback="MH" />} alt="" className="h-10 w-10 rounded-full" />
 */
export function Img({ src, candidates, fallback = null, alt = "", className, style }: ImgProps) {
  const list = candidates ?? (src ? [src] : []);
  const { status, url, refCallback, handleLoad, handleError } = useImageLoader(list);

  if (status === "failed" || !url) return <>{fallback}</>;

  return (
    <img
      ref={refCallback}
      src={url}
      onLoad={handleLoad}
      onError={handleError}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
