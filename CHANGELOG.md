# Changelog

## 0.0.31
- feat(ui): `MediaCard` — 썸네일+배지 미디어 카드 (horizontal/vertical)
- feat(ui): `UnderlineTabs` — 언더라인 콘텐츠 필터 탭 (하단 내비 TabBar와 별개)
- feat(utils): `formatKoreanNumber`(만/억/천 축약), `parseIsoDuration`/`isoDurationToSec`(유튜브 API "PT1H2M3S")

## 0.0.30
- feat(fetch): useFetch stale-while-revalidate 기본화 — 캐시 있으면 (stale이어도) 즉시 표시 후 백그라운드 재검증, `revalidating` 상태 추가
  - ⚠️ semi-breaking: `loading`은 이제 캐시가 전혀 없는 첫 로드에서만 true. `loading && !!data`로 재검증을 감지하던 코드는 `revalidating`으로 교체
  - 백그라운드 재검증 실패 시 기존 데이터 유지 (`status`는 "success" 유지)
- feat(ui): `FetchProgress` — 전역 useFetch 활동 기반 상단 로딩바 (`variant: "sweep" | "creep"`, `active`로 수동 제어 가능)
- feat(fetch): `subscribeFetchActivity` / `getFetchActiveCount` — 전역 fetch 인플라이트 추적
- feat(ui): `Tab`에 `render` prop — 라우터 Link 주입으로 프리페치 지원
- feat(powered-by): 푸터 방문자 카운터 클릭 → 통계 상세 시트 (오늘·7일·30일·누적 + 30일 일별 차트 + make-1k 진행률, `?view=public` CORS API 사용. 국가·기기·유입경로는 m1k.app 링크로)
- feat(fetch): `invalidateFetch(url?)` — 캐시 무효화 + 마운트된 useFetch 강제 재조회 (invalidateQueries 대체)
- feat(fetch): `postJson(body)` — POST 조회용 fetcher. 캐시 키는 `경로#식별자` 컨벤션
- feat(ui): `AsyncList` — 로딩/에러/빈/성공 4상태 비동기 리스트 (useFetch status 직결)
- feat(ui): `IconButton` — ghost/outline 아이콘 전용 버튼
- feat(ui): `Input`/`Textarea` — label 없는 단독 입력 프리미티브 (Field와 동일 스타일 토큰)
- feat(ui): `Divider`에 `spacing`("none"|"sm"|"md")·`color` prop
- feat(utils): `fillDateSeries` — 일별 시계열 0-채움 (powered-by 내부 구현 승격)

## 0.0.17
- fix(watermark): 긴 텍스트 줄바꿈 + 3D 렌더링 개선

## 0.0.16
- 이전 버전
