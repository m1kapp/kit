"use client";

/* ─────────────────────────────────────────
   Global fetch activity store

   Counts in-flight useFetch requests (including background
   revalidations) so UI like <FetchProgress /> can show a
   top loading bar without wiring per-call state.
───────────────────────────────────────── */

let _active = 0;
const _listeners = new Set<() => void>();

function emit() {
  for (const l of _listeners) l();
}

export function trackFetchStart() {
  _active++;
  emit();
}

export function trackFetchEnd() {
  _active = Math.max(0, _active - 1);
  emit();
}

/** Subscribe to fetch activity changes. Returns an unsubscribe function. */
export function subscribeFetchActivity(listener: () => void): () => void {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

/** Number of useFetch requests currently in flight. */
export function getFetchActiveCount(): number {
  return _active;
}
