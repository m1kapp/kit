---
name: m1kapp-init
description: "@m1kapp/kit 기반 Next.js 프로젝트 초기 설정을 인터랙티브하게 완성합니다."
---

현재 디렉토리가 Next.js + @m1kapp/kit 프로젝트인지 확인한 뒤, 아래 순서대로 진행한다.

## Step 0: 프로젝트 파악

먼저 조용히 다음을 확인한다 (사용자에게 보고하지 않음):
- `package.json` — 프레임워크, @m1kapp/kit 버전
- `app/layout.tsx` — 기존 metadata 여부
- `app/sitemap.ts`, `app/robots.ts` 존재 여부
- `public/` — 파비콘, OG 이미지 여부
- `tailwind.config.*` — 테마 컬러 여부

파악이 끝나면 아래 질문들을 **한 번에 모아서** 사용자에게 묻는다.

---

## Step 1: 인터랙티브 질문

다음 항목들을 자연스럽게 한 번에 물어본다. 이미 파악한 정보는 기본값으로 채워서 제안한다.

```
@m1kapp/kit 초기 설정을 시작할게요. 몇 가지만 확인할게요!

1. 앱 이름이 뭔가요?
   (예: "My App", "스타트업 서비스명")

2. 메인 테마 컬러가 있나요?
   (hex 코드로 알려주세요. 없으면 기본 파란색 #3B82F6 쓸게요)

3. 앱 한 줄 설명이 뭔가요?
   (메타 description + OG에 사용됩니다)

4. 배포 URL이 있나요?
   (예: https://myapp.com — SEO canonical, sitemap 등에 사용)

5. 앱 유형은 뭔가요?
   (1) 커머스/쇼핑
   (2) 블로그/콘텐츠
   (3) 대시보드/툴
   (4) 소셜/커뮤니티
   (5) 랜딩/홍보
   (6) 기타

6. 다음 중 적용할 것을 골라주세요 (복수 선택, 예: 1 2 3)
   (1) SEO — metadata, sitemap, robots, JSON-LD
   (2) PWA — manifest, 설치 유도 버튼, 아이콘
   (3) OG 이미지 — /og 라우트 자동 생성
   (4) 파비콘 — 자동 생성 (m1kkit 필요)
```

---

## Step 2: 적용 계획 출력

답변을 받으면 아래 형식으로 적용 계획을 보여준다:

```
✓ 확인했어요! 이렇게 적용할게요:

앱 이름:     [앱 이름]
테마 컬러:   [색상] ████ 
설명:        [한 줄 설명]
배포 URL:    [URL]

적용 항목:
  ☐ app/layout.tsx    — metadata, titleTemplate 설정
  ☐ app/sitemap.ts    — nextSitemap 생성
  ☐ app/robots.ts     — nextRobots 생성
  ☐ app/og/route.tsx  — OG 이미지 라우트
  ☐ app/manifest.ts   — PWA manifest
  ☐ tailwind.config   — 테마 컬러 등록

시작할까요? (y/n)
```

y면 Step 3 진행, n이면 수정할 항목 다시 묻기.

---

## Step 3: 파일 생성/수정

확인된 답변을 바탕으로 선택한 항목들을 순서대로 적용한다.
각 파일 완료 시 체크 표시:

```
  ✓ app/layout.tsx    완료
  ✓ app/sitemap.ts    완료
  ✓ app/robots.ts     완료
  ...
```

### layout.tsx 적용 규칙
- 기존 파일이 있으면 `metadata` export만 교체, 나머지는 보존
- `@m1kapp/kit/seo`의 `createMetadata`, `titleTemplate` 사용
- 앱 유형에 따라 적절한 JSON-LD도 추가 (WebSite, Organization 등)

```ts
import { createMetadata, titleTemplate } from "@m1kapp/kit/seo"

export const metadata = createMetadata({
  title: "[앱 이름]",
  description: "[한 줄 설명]",
  url: "[배포 URL]",
  siteName: "[앱 이름]",
  image: "[배포 URL]/og",
})
```

### sitemap.ts 적용 규칙
- 이미 있으면 건너뛰고 사용자에게 알림
- `app/` 하위 `page.tsx` 파일 목록을 스캔해서 자동으로 경로 추출
- 동적 라우트(`[id]`)는 TODO 주석으로 표시

### robots.ts 적용 규칙
- `nextRobots` 사용
- `/api`, `/admin` 등 일반적인 disallow 패턴 자동 적용

### OG 이미지 적용 규칙
- `app/og/route.tsx` 생성
- `@m1kapp/kit/ogimage`의 템플릿 사용
- 앱 이름 + 테마 컬러 반영

### PWA manifest 적용 규칙
- `app/manifest.ts` 생성
- `@m1kapp/kit/pwa`의 `createManifest` 사용
- 테마 컬러 자동 반영

### tailwind 테마 컬러 적용 규칙
- `tailwind.config.ts` 또는 `globals.css`에 CSS 변수로 추가
- `--color-primary: [hex]` 형태로

---

## Step 4: 완료 요약

```
🎉 설정 완료!

적용된 파일:
  ✓ app/layout.tsx
  ✓ app/sitemap.ts
  ...

다음 단계:
  → 배포 후 https://search.google.com/search-console 에 사이트 등록
  → /og 라우트 접속해서 OG 이미지 확인
  → npx m1kkit favicon 으로 파비콘 생성
```

---

## 주의사항
- 기존 코드를 덮어쓸 때는 반드시 원본 내용을 보존하면서 필요한 부분만 추가/수정
- TypeScript 타입 에러가 없도록 lint 후 보고
- 파일 생성 전 이미 있는 경우 사용자에게 알리고 덮어쓸지 확인
