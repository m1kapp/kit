# Changelog

## 0.0.39
- ci: npm Trusted Publishing(OIDC) 파이프라인으로 전환 — 이 릴리스부터 태그 푸시가 곧 publish

## 0.0.38
- fix(segmented-control): 좁은 화면에서 라벨이 두 줄로 쪼개지던 버그 — 버튼에 `whitespace-nowrap`, 루트에 `shrink-0` 추가. 형제 엘리먼트와 flex로 공간을 나누다 찌부러들면서 "30일"이 "30"/"일" 두 줄로 줄바꿈됐다
- fix(demo): 템플릿 갤러리(`DataDashboardTemplate`/`LandingTemplate`)의 지어낸 지표 제거 — 실측 이력 없는 `+18%`류 증감률과 `"이미 2,400+명이 사용 중"` 소셜프루프. 남은 예시 숫자엔 "예시 데이터" 라벨을 붙임
- **fix(app-shell): 컴파일 CSS가 `<head>`에 두 번 삽입돼 다크모드 텍스트가 조용히 안 보이던 버그.** `AppShell`의 `<style href precedence>`와 `inject-styles.ts`의 자동 주입이 겹쳐서 발생 — 후자의 중복 감지가 잘못된 셀렉터라 한 번도 안 걸렸다. `.dark\:*` variant는 `:where()`로 specificity를 plain과 동일하게 맞추는 표준 레시피라, 스타일시트가 두 벌이면 문서 순서가 꼬여 다크모드 색이 라이트모드 값으로 조용히 폴백한다(콘솔 에러 없음). `AppShell`은 더 이상 직접 스타일을 렌더링하지 않음 — 기존 데모 앱 포함 전부 재현·수정 확인
- polish(template): `m1kkit new` 첫 화면에 Avatar 리드 아이콘 + 실제 온보딩 체크리스트("테마 바꾸기"/"SEED 교체"/"트래커 연결") 추가 — lead 없는 flat한 카드 + "첫 항목/두 번째 항목" 무의미 텍스트가 허접해 보인다는 피드백 반영
- feat(watermark): 넓은 화면에서 셸을 확대 (`zoom`, 기본 켬) — 430px 폰 셸이 화면이 커져도 안 자라서 워터마크 여백만 넓어졌다. 실측으로 화면 점유율이 1440px 26% → 2560px 10%까지 떨어짐. `clamp()`로 뷰포트 폭에 연속 비례(1024px 이하 1배, ~1920px 1.3배, 2560px+ 1.5배 상한 — 미디어쿼리 두 단이 아니라 리사이즈 중 끊기지 않는 연속 곡선). 끄려면 `<Watermark zoom={false}>`, 배율 고정은 `zoom={1.2}`
- feat(cli): `m1kkit new <name>` — 검증된 Vite + React + kit 템플릿을 복사해 새 앱 생성. 이름/컬러/한줄/배포URL 4문항만 묻고, `--url`을 주면 방문자 트래커 등록·배선까지 한 번에. 산문 스킬이 매번 코드를 다시 타이핑하며 깨뜨리던 것들(`useState(colors.blue)` 리터럴 협착, `vite-env.d.ts` 누락, TODO만 남은 빈 화면)을 실파일로 고정하고 테스트로 잠금
- feat(cli): `m1kkit track <url> --write` — 발급받은 slug를 `<Watermark trackSlug>`와 `.env`에 직접 꽂는다. 지금까지 `track`은 slug를 `.m1k.json`에 적어두기만 하고 앱에 연결하는 단계가 아예 없어서, "트래커를 붙였다"가 사실이 아닌 경우가 많았다
- fix(cli): `track` 성공 안내가 프로젝트 종류와 무관하게 `NEXT_PUBLIC_M1K_SLUG`를 알려주던 문제 — Vite 프로젝트에서 그대로 따르면 `process.env`가 없어 조용히 집계 0이 된다(에러도 안 남). vite/next를 감지해 각각의 방법을 안내
- **breaking(list-row): 왼쪽 컬러바가 opt-in으로 바뀜 (`bar`, 기본 `false`).** 한쪽 모서리의 굵은 컬러 스트라이프는 널리 알려진 생성형 UI 티라서 기본값에서 뺐다. 색이 실제로 분류를 뜻하는 일정/간트에서만 `<ListRow bar accent="...">`로 켠다. 기존 모양을 유지하려면 `bar`를 추가할 것
- docs(skill): `m1kapp-init`을 `m1kkit new` 래퍼로 재작성 — 뼈대는 템플릿이, 첫 화면의 살은 LLM이. 새 `m1kapp-new` 스킬을 `m1kkit skills`로 배포

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
