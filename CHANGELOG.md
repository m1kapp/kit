# Changelog

## 0.0.37
- feat(cli): `m1kkit stats` 청결도에 **파일 I/O 밀도** 축 — cognitive·중복은 "코드가 얼마나 꼬였나"만 봐서 5줄짜리 흠 없는 함수가 루프에서 수백 번 불리는 N+1은 원리상 못 잡는다. 파일 읽는 함수를 호출 그래프 2홉까지 전파해(얇은 접근자가 진짜 주인공이라) for/map 안에서 무캐시로 불리는 자리를 감점(×4, 최대 20). 모듈 캐시(Map get/set) 끼면 참고로만. `quality.io`에 위치 기록
- feat(cli): `m1kkit stats` 청결도에 **렌더 인질** 축 — `{data && <Nav a={local} b={data.x} />}`처럼 fetch 하나가 자기와 무관한 프롭까지 통째로 게이트하는 자리를 잡는다. 훅 값으로 게이트된 JSX에서 실제 의존 프롭 비율이 절반 미만이면 인질로 보고 감점(×3, 최대 10). `quality.renderGates`에 위치·의존 비율 기록
- fix(cli): io 축 오탐 제거 — 모듈 변수 메모이제이션(`let memo = null` 후 읽고 재대입)과 2단 캐시의 디스크 티어 읽기를 캐시로 인식. Map이 아닌 형태의 캐시를 놓치던 문제 해소
- revert(watermark): PoweredByKit 화면 바닥 고정 되돌림 — 카드+뱃지를 한 덩어리로 재중앙정렬

## 0.0.36
- feat(fetch-progress, app-shell): `FetchProgress`의 `top`이 CSS 길이 문자열도 받도록, 헤더 높이 상수 export

## 0.0.35
- fix: 실기기 아니면 안 보이는 디테일 버그 13건 정리

## 0.0.34
- fix(field, input): 15px 폰트가 iOS 사파리 인풋 포커스 자동확대를 유발 — 16px로 상향

## 0.0.33
- fix(tab-bar): 세이프에어리어 패딩 이중 적용 제거

## 0.0.32
- fix(cli): `m1kkit stats` 200줄+ 파일 감점 절벽 완화 — 이진 카운트(200줄 넘으면 무조건 파일당 1) 대신 초과분 비례 심각도(200→400줄 0→1, 400→600줄 1→2, 600줄+ 캡)로 채점. 파일 수 적은 프로젝트가 파일 1개만 살짝 넘어도 즉시 만점 감점 맞던 문제 해소, 심하게 큰 파일은 기존과 동일하게 페널티 유지

## 0.0.31
- feat(cli): `m1kkit stats`에 코드 청결도 분석 — 분기밀도·평균 파일 길이·200줄+ 파일 수 기반 score/grade를 kit-stats.json `quality`에 기록
- feat(cli): `m1kkit stats` 프론트/백엔드/공용 분리 집계 — `source.breakdown`에 버킷별 files·codeLines (api·route·middleware·"use server"=backend, tsx·"use client"=frontend, 나머지=shared)
- feat(cli): 청결도 AST 업그레이드 — 프로젝트의 typescript로 함수별 cyclomatic complexity 측정(McCabe), `quality.cc`에 avg/p90/max/over10/over20/worst5 기록, 비율 기반 감점제 재설계. typescript 없으면 regex 폴백(`quality.engine`)
- feat(skill): `/m1kapp-clean` — 청결도 올리기 스킬. CC 높은 함수부터 표준 기법(조기 반환·분기 테이블화·헬퍼 추출)으로 리팩토링 후 stats 재측정 루프
- refactor: kit 자체 청결도 C(60) → A+(94) — PoweredByKit CC31 분해(방문자 통계/크레딧 시트 분리), GrassMap·ActionCard·Shell(og)·InAppSheet·Stepper·Collapsible 정리, og.tsx 5모듈 분할, 200줄+ 파일 0개. 공개 API 불변
- refactor(demo): App.tsx 2,813줄 → 24개 파일 분할, 데모 청결도 B(73) → A+(94)
- feat(cli): 청결도 스코어 v2 — cognitive complexity(중첩 가중, 논리연쇄 1회, ?? 제외) + **중복 코드 감지**(토큰 정규화 슬라이딩 윈도우, 리터럴 원문 유지·테스트 제외)가 채점 축. `quality.cognitive`·`quality.duplication`(worstBlocks 위치 포함) 기록, cc는 참고용 유지
- feat(cli): `m1kkit stats --llm` — Claude(haiku)로 최악 함수들 네이밍·응집도·본질적 복잡성 자문. 점수 미반영(결정성 유지), `quality.llm`에 기록
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
