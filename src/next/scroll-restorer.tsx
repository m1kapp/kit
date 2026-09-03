"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// 페인트 전에 스크롤을 되돌려야 "맨 위로 튀었다 복귀"하는 깜빡임이 없다. 서버에선
// useLayoutEffect 가 경고를 내므로 클라이언트에서만 layout 타이밍을 쓴다.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// 스크롤 규칙: 상세→목록처럼 뒤로 오면 복원(기본), 탭 전환은 최상단.
// 뒤로가기(pop)를 Next 내부와 타이밍 맞춰 잡기가 어려워, 대신 앱이 제어하는
// 탭바 클릭 때 markTabNavigation() 으로 "최상단" 플래그를 세운다(그 외는 기본=복원).
const nav = globalThis as unknown as { __kitForceTop?: boolean };
export function markTabNavigation() {
  nav.__kitForceTop = true;
}

/**
 * 뒤로가기 스크롤 복원 (Next 전용 — usePathname/useSearchParams 를 쓴다).
 *
 * AppShell 앱의 스크롤은 window 가 아니라 AppShellContent 의 내부 컨테이너
 * (`.tab-scroll`)에서 일어나서 브라우저 기본 복원이 안 먹는다 — URL 별 스크롤
 * 위치를 sessionStorage 에 저장해 두고 다시 그 URL 로 돌아오면 되돌린다.
 * 레이아웃에 한 번 두면 된다: `<Suspense><ScrollRestorer /></Suspense>`
 * (useSearchParams 때문에 Suspense 경계가 필요하다).
 *
 * 까다로운 점: 목록에서 상세(다른 레이아웃)로 갔다 돌아오면 컨테이너가 통째로
 * 새로 생기는데, 그 순간엔 목록이 아직 덜 그려져 높이가 부족하다. 그냥 scrollTop 을
 * 한 번 넣으면 잘려서(클램프) 맨 위로 튄다. 그래서 콘텐츠가 목표 높이에 도달할
 * 때까지 짧게 재시도하고(ResizeObserver + rAF), 복원 중엔 저장을 멈춘다(잘린
 * 위치가 좋은 값을 덮어쓰지 않도록). 사용자가 실제로 스크롤하면 즉시 포기한다.
 *
 * ytcc 에서 실전 검증된 코드를 그대로 올렸다.
 */
export function ScrollRestorer({ selector = ".tab-scroll" }: { selector?: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useIsoLayoutEffect(() => {
    const el = document.querySelector(selector);
    if (!(el instanceof HTMLElement)) return;

    // 탭 전환이면 최상단, 아니면 저장된 위치 복원(상세→목록 뒤로가기 등).
    const forceTop = nav.__kitForceTop === true;
    nav.__kitForceTop = false;

    const key = `scroll:${pathname}?${search}`;
    const saved = Number(sessionStorage.getItem(key));
    const target = forceTop ? 0 : Number.isFinite(saved) && saved > 0 ? saved : 0;

    let restoring = target > 0;
    let ro: ResizeObserver | null = null;
    let rafRestore = 0;
    let rafSave = 0;
    let pendingTop: number | null = null; // 아직 안 쓴 마지막 정상 스크롤 위치
    let lastTop = target; // 최근 저장 기준 위치 — 갑작스런 0 점프(리셋) 판별용

    const stopRestore = () => {
      if (!restoring) return;
      restoring = false;
      ro?.disconnect();
      cancelAnimationFrame(rafRestore);
    };

    const flush = () => {
      if (pendingTop != null) {
        sessionStorage.setItem(key, String(pendingTop));
        pendingTop = null;
      }
    };

    // 저장 규칙. 목록에서 상세로 넘어갈 때 프레임워크가 scrollTop 을 0 으로 리셋하는데
    // (내용은 아직 남아 있어 scrollHeight 가드로는 못 걸러진다), 그 프로그램적 scroll 이
    // 방금 저장한 좋은 위치를 0 으로 덮어써 뒤로가기 복원이 깨졌다.
    // 핵심 판별: 큰 위치에서 "한 방에 0 으로" 점프한 건 리셋이다 — 사용자가 위로
    // 스크롤하면 중간값들을 거쳐 0 에 닿으므로 그때의 lastTop 은 0 근처다.
    const RESET_JUMP = 300;
    const save = () => {
      if (restoring) return;
      const top = el.scrollTop;
      if (el.scrollHeight - el.clientHeight <= 0) return; // 내용 없음(언마운트/로딩)
      if (top === 0 && lastTop > RESET_JUMP) return; // 큰 위치→0 급점프 = 리셋, 무시
      lastTop = top;
      pendingTop = top;
      cancelAnimationFrame(rafSave);
      rafSave = requestAnimationFrame(flush);
    };
    // 사용자가 직접 스크롤하면 복원 포기(우리가 넣는 위치와 안 싸우게)
    const onUserInput = () => stopRestore();

    el.addEventListener("scroll", save, { passive: true });
    el.addEventListener("wheel", onUserInput, { passive: true });
    el.addEventListener("touchmove", onUserInput, { passive: true });
    el.addEventListener("pointerdown", onUserInput, { passive: true });
    window.addEventListener("keydown", onUserInput);

    if (restoring) {
      const deadline = performance.now() + 1200;
      const apply = () => {
        if (!restoring) return;
        el.scrollTop = target;
        const canReach = el.scrollHeight - el.clientHeight >= target - 1;
        if (canReach || performance.now() > deadline) stopRestore();
      };
      // 페인트 전에 즉시 한 번 — 뒤로가기는 대개 DOM 이 완성된 높이로 마운트되므로
      // 여기서 끝난다(점프 없이 그 자리에 있던 것처럼 보임). 높이가 아직 덜 찬 경우만
      // 아래 ResizeObserver/rAF 로 목표 높이에 닿을 때까지 재시도한다.
      apply();
      if (restoring) {
        ro = new ResizeObserver(apply);
        ro.observe(el);
        if (el.firstElementChild) ro.observe(el.firstElementChild);
        const tick = () => {
          if (!restoring) return;
          apply();
          if (restoring) rafRestore = requestAnimationFrame(tick);
        };
        rafRestore = requestAnimationFrame(tick);
      }
    } else {
      // 탭 전환·새 진입(push) — 탭들이 컨테이너를 공유해 이전 스크롤이 남으므로
      // 명시적으로 최상단으로 올린다.
      el.scrollTop = 0;
    }

    return () => {
      cancelAnimationFrame(rafSave);
      flush(); // 언마운트 직전, 아직 안 쓴 마지막 정상 위치를 확정 저장
      cancelAnimationFrame(rafRestore);
      ro?.disconnect();
      el.removeEventListener("scroll", save);
      el.removeEventListener("wheel", onUserInput);
      el.removeEventListener("touchmove", onUserInput);
      el.removeEventListener("pointerdown", onUserInput);
      window.removeEventListener("keydown", onUserInput);
    };
  }, [pathname, search, selector]);

  return null;
}
