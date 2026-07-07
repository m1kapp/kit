# Changelog

## 0.0.30
- feat(fetch): useFetch stale-while-revalidate 기본화 — 캐시 있으면 (stale이어도) 즉시 표시 후 백그라운드 재검증, `revalidating` 상태 추가
  - ⚠️ semi-breaking: `loading`은 이제 캐시가 전혀 없는 첫 로드에서만 true. `loading && !!data`로 재검증을 감지하던 코드는 `revalidating`으로 교체
  - 백그라운드 재검증 실패 시 기존 데이터 유지 (`status`는 "success" 유지)
- feat(ui): `FetchProgress` — 전역 useFetch 활동 기반 상단 로딩바 (`variant: "sweep" | "creep"`, `active`로 수동 제어 가능)
- feat(fetch): `subscribeFetchActivity` / `getFetchActiveCount` — 전역 fetch 인플라이트 추적
- feat(ui): `Tab`에 `render` prop — 라우터 Link 주입으로 프리페치 지원

## 0.0.17
- fix(watermark): 긴 텍스트 줄바꿈 + 3D 렌더링 개선

## 0.0.16
- 이전 버전
