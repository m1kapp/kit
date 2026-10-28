"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * loading: 기기 상태를 읽는 중 · unsupported: 이 브라우저엔 푸시가 없다(iOS 는 홈 화면 앱에만 있다)
 * denied: 브라우저 설정에서 막혔다 — 다시 물을 수 없다 · off · on
 */
export type PushState = "loading" | "unsupported" | "denied" | "off" | "on";

export interface UsePushOptions {
  /** VAPID 공개키(base64url) */
  vapidKey: string;
  /** 구독을 서버에 저장한다. quiet: 이미 켜진 기기가 열릴 때 다시 알리는 것(서버는 실패한 구독을 지운다) */
  save: (subscription: PushSubscriptionJSON, quiet: boolean) => Promise<void>;
  /** 서버에서 구독을 지운다 */
  remove: (endpoint: string) => Promise<void>;
  /** 푸시를 받는 서비스 워커. 기본 /sw.js */
  sw?: string;
}

export interface UsePushReturn {
  state: PushState;
  /** 켜는 중·끄는 중 — state 는 그동안 그대로다(스위치가 깜빡이지 않는다) */
  busy: boolean;
  /** 마지막 켜기가 왜 실패했는지 — 사람에게 보여줄 한국어. 브라우저 원문은 콘솔로 */
  reason: string;
  /** 켜졌으면 true — 실패 이유는 reason 에 */
  enable: () => Promise<boolean>;
  disable: () => Promise<void>;
}

/** base64url → applicationServerKey 바이트 */
export function pushKeyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/** 다른 공개키로 만든 구독(키를 바꿨다)은 보낼 수 없고, 브라우저는 그 옆에 새 구독을 안 만들어 준다 — 먼저 지워야 한다 */
export function samePushKey(own: ArrayBuffer | null | undefined, vapidKey: string): boolean {
  if (!own) return true;
  const mine = new Uint8Array(own);
  const wanted = pushKeyBytes(vapidKey);
  return mine.length === wanted.length && mine.every((b, i) => b === wanted[i]);
}

// 헤더 버튼·목록 중간 줄·설정 스위치가 같은 상태를 본다 — 한쪽에서 켜면 다른 쪽도 바로 바뀐다
const store = { state: "loading" as PushState, reason: "", busy: false, started: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<typeof store>) => {
  Object.assign(store, patch);
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

/**
 * 웹 푸시 켜기·끄기. 권한은 enable() 에서만 묻는다(iOS 는 탭 안에서만 물을 수 있다) —
 * 언제 물을지(미리보기 시트, 첫 탭 …)는 앱이 정한다.
 *
 * @example
 * const push = usePush({
 *   vapidKey: VAPID_PUBLIC_KEY,
 *   save: (sub) => fetch("/api/push", { method: "POST", body: JSON.stringify(sub) }).then(() => {}),
 *   remove: (endpoint) => fetch("/api/push", { method: "DELETE", body: JSON.stringify({ endpoint }) }).then(() => {}),
 * });
 * <Switch checked={push.state === "on"} onChange={(on) => (on ? push.enable() : push.disable())} />
 */
export function usePush({ vapidKey, save, remove, sw = "/sw.js" }: UsePushOptions): UsePushReturn {
  const state = useSyncExternalStore(subscribe, () => store.state, () => "loading" as PushState);
  const reason = useSyncExternalStore(subscribe, () => store.reason, () => "");
  const busy = useSyncExternalStore(subscribe, () => store.busy, () => false);

  useEffect(() => {
    if (store.started) return;
    store.started = true;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      return set({ state: "unsupported" });
    }
    if (Notification.permission === "denied") return set({ state: "denied" });
    navigator.serviceWorker
      .register(sw)
      .then((reg) => reg.pushManager.getSubscription())
      .then(async (sub) => {
        if (sub && samePushKey(sub.options?.applicationServerKey, vapidKey)) {
          set({ state: "on" });
          return save(sub.toJSON(), true).catch((e) => console.warn("push", e));
        }
        if (sub) await sub.unsubscribe().catch(() => {});
        set({ state: "off" });
      })
      .catch(() => set({ state: "unsupported" }));
    // 기기당 한 번 — 옵션이 바뀌어도 다시 읽지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enable = async (): Promise<boolean> => {
    set({ busy: true });
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        set({
          state: permission === "denied" ? "denied" : "off",
          busy: false,
          reason: permission === "denied" ? "" : "알림 권한을 허용해야 켤 수 있어요",
        });
        return false;
      }
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing && !samePushKey(existing.options?.applicationServerKey, vapidKey)) await existing.unsubscribe();
      const sub =
        existing && samePushKey(existing.options?.applicationServerKey, vapidKey)
          ? existing
          : await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: pushKeyBytes(vapidKey) });
      await save(sub.toJSON(), false);
      set({ state: "on", reason: "", busy: false });
      return true;
    } catch (e) {
      console.warn("push", e);
      // 푸시 서비스가 없는 브라우저(AbortError) — 다시 눌러도 안 된다, 설치하면 된다
      if (e instanceof Error && e.name === "AbortError") set({ state: "unsupported", reason: "", busy: false });
      else set({ state: "off", reason: "알림을 켜지 못했어요 · 잠시 후 다시 눌러 주세요", busy: false });
      return false;
    }
  };

  const disable = async () => {
    set({ busy: true });
    try {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (sub) {
        await remove(sub.endpoint).catch((e) => console.warn("push", e));
        await sub.unsubscribe().catch(() => {});
      }
    } finally {
      set({ state: "off", reason: "", busy: false });
    }
  };

  return { state, busy, reason, enable, disable };
}
