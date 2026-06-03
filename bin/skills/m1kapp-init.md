---
name: m1kapp-init
description: "@m1kapp/kit 기반 Next.js 프로젝트 초기 설정을 인터랙티브하게 완성합니다. (앱쉘 레이아웃 + SEO + PWA + OG + 파비콘)"
---

현재 디렉토리가 Next.js + @m1kapp/kit 프로젝트인지 확인한 뒤, 아래 순서대로 진행한다.

---

## ⚠️ 핵심 규칙 — 매번 여기서 틀린다. 먼저 읽어라.

@m1kapp/kit은 단순 SEO 유틸이 아니라 **모바일 앱 셸 UI 프레임워크**다. 아래는 한 번에 되게 하려면 반드시 지킬 것:

1. **`app/layout.tsx`에 스타일/셸 import 3종 세트는 필수다.** 하나라도 빠지면 컴포넌트가 스타일 없이 깨지거나 좌측 정렬된다.
   ```ts
   import "@m1kapp/kit/styles.css";              // ← 없으면 AppShell/모든 컴포넌트 스타일 안 먹음 (제일 자주 빠뜨림)
   import { KitStyles, mobileViewport } from "@m1kapp/kit/pwa";
   // <head> 안에 <KitStyles />, 그리고 export const viewport = mobileViewport;
   ```

2. **앱 화면은 반드시 이 트리로 감싼다.** `AppShell`만 쓰면 화면 좌측에 붙고 휑하다. 중앙정렬·풀화면 배경·powered-by 풋터는 `Watermark`가 담당한다.
   ```tsx
   "use client";
   import { Watermark, AppShell, AppShellHeader, AppShellContent, TabBar, Tab } from "@m1kapp/kit";

   <Watermark color="#0a0d16" text="앱이름" maxWidth={460}>
     <AppShell maxWidth={460}>
       <AppShellHeader>…헤더…</AppShellHeader>
       <AppShellContent>…스크롤 본문…</AppShellContent>
       <TabBar>
         <Tab active={…} onClick={…} label="홈" icon={<span>🏠</span>} activeColor="[테마컬러]" />
       </TabBar>
     </AppShell>
   </Watermark>
   ```
   - `AppShell`/`TabBar`는 인터랙티브 → 이 트리는 **`"use client"` 컴포넌트**에 둔다. 데이터는 서버 컴포넌트(page.tsx)에서 계산해 props로 내려준다.
   - `maxWidth`는 Watermark와 AppShell을 **같은 값**으로 맞춘다(기본 430~460).

3. **이모지는 토스페이스로 통일한다.** 장식용 이모지는 남발하지 말고, 쓰는 이모지는 토스 스타일로 폴백시킨다.
   - layout `<head>`에 `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />`
   - `globals.css` 폰트 스택에 `"Tossface"`를 본문/디스플레이 폰트 **뒤에** 끼우면 이모지 글자만 자동 폴백된다.

4. **🚫 `node_modules/@m1kapp/kit` 디렉토리 안에서 `npm run build`/스크립트를 절대 돌리지 마라.** kit 자체 빌드가 돌아 `dist/`를 날린다. 깨지면 `rm -rf node_modules/@m1kapp/kit && npm install @m1kapp/kit`로 복구. 빌드는 항상 프로젝트 루트에서.

5. **kit 컴포넌트 카탈로그**(필요 시 골라 쓰기): 레이아웃 `AppShell/AppShellHeader/AppShellContent`, 내비 `TabBar/Tab/Fab`, 표시 `Section/SectionHeader/StatChip/Badge/Avatar/EmptyState/Divider`, 브랜딩 `Watermark`, 입력 `Button/EmojiButton`, 테마 `ThemeButton/ThemeDialog`, 모션 `Typewriter`. SEO는 `@m1kapp/kit/seo`, OG는 `@m1kapp/kit/ogimage`, PWA는 `@m1kapp/kit/pwa`.

---

## Step 0: 프로젝트 파악

먼저 조용히 다음을 확인한다 (사용자에게 보고하지 않음):
- `package.json` — 프레임워크, @m1kapp/kit 버전
- `app/layout.tsx` — 기존 metadata / styles.css import / KitStyles 여부
- `app/page.tsx` — 이미 앱쉘로 감겨 있는지
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/og/route.tsx` 존재 여부
- `public/` — 파비콘, OG 이미지 여부
- `globals.css` / `tailwind.config.*` — 테마 컬러, 폰트 스택 여부

파악이 끝나면 아래 질문들을 **한 번에 모아서** 사용자에게 묻는다.

---

## Step 1: 인터랙티브 질문

다음 항목들을 자연스럽게 한 번에 물어본다. 이미 파악한 정보는 기본값으로 채워서 제안한다.

```
@m1kapp/kit 초기 설정을 시작할게요. 몇 가지만 확인할게요!

1. 앱 이름이 뭔가요?
2. 메인 테마 컬러가 있나요? (hex. 없으면 #3B82F6)
3. 앱 한 줄 설명이 뭔가요? (메타 description + OG)
4. 배포 URL이 있나요? (예: https://myapp.com)
5. 앱 유형은? (1)커머스 (2)블로그 (3)대시보드/툴 (4)소셜 (5)랜딩 (6)기타

6. 적용할 것을 골라주세요 (복수 선택)
   (1) 앱쉘 레이아웃 — Watermark + AppShell + 헤더 + TabBar  ← 추천 (앱의 뼈대)
   (2) Tossface 이모지 — 토스 스타일 이모지 폰트 적용
   (3) SEO — metadata, sitemap, robots, JSON-LD
   (4) PWA — manifest, 설치 유도 버튼, 아이콘
   (5) OG 이미지 — /og 라우트 자동 생성
   (6) 파비콘 — 자동 생성 (m1kkit 필요)
```

기본 추천은 **(1)(2)(3)(5)(6) 전체** — 앱쉘 없이 SEO만 깔면 "kit으로 만들었는데 화면이 휑하다"는 결과가 된다.

---

## Step 2: 적용 계획 출력

```
✓ 확인했어요! 이렇게 적용할게요:

앱 이름:   [이름]   테마: [색] ████   배포: [URL]

적용 항목:
  ☐ app/layout.tsx        — styles.css/KitStyles/Tossface import, metadata, viewport
  ☐ components/AppRoot.tsx — Watermark>AppShell>Header/Content/TabBar ("use client")
  ☐ app/page.tsx          — 데이터 계산 후 <AppRoot/> 렌더
  ☐ app/globals.css       — 테마 컬러 + Tossface 폰트 스택
  ☐ app/sitemap.ts / robots.ts / manifest.ts / og/route.tsx

시작할까요? (y/n)
```

y면 Step 3, n이면 수정할 항목 다시 묻기.

---

## Step 3: 파일 생성/수정

선택한 항목을 순서대로 적용하고, 각 파일 완료 시 `✓ 파일명 완료` 표시.

### layout.tsx — (모든 프로젝트 공통, 항상 적용)
```ts
import "@m1kapp/kit/styles.css";                         // ★ 필수
import { createMetadata, titleTemplate } from "@m1kapp/kit/seo";
import { KitStyles, mobileViewport } from "@m1kapp/kit/pwa";
import "./globals.css";

export const metadata = createMetadata({
  title: "[앱 이름]", description: "[설명]", url: "[URL]",
  siteName: "[앱 이름]", image: "[URL]/og",
});
export const viewport = mobileViewport;
// <head>에 <KitStyles /> + (Tossface 선택 시) tossface <link>
// JSON-LD는 앱 유형에 맞게 jsonLd.website / jsonLd.organization 추가
```
- 기존 파일이 있으면 import/exports만 보강하고 나머지 구조는 보존.

### 앱쉘 레이아웃 — (1) 선택 시
- `"use client"` 컴포넌트(예: `components/AppRoot.tsx`)에 위 **핵심 규칙 2번** 트리를 그대로 생성.
- `page.tsx`(서버 컴포넌트)는 데이터만 계산해서 `<AppRoot data={…} />`로 내려준다.
- 탭이 여러 개면 `useState`로 탭 전환, 각 탭은 별도 패널 컴포넌트로 분리.
- `AppShellContent` 안의 섹션은 `Section`/`SectionHeader`/`StatChip` 등 kit 컴포넌트를 우선 사용.

### Tossface 이모지 — (2) 선택 시
- layout `<head>`: `<link rel="preconnect" href="https://cdn.jsdelivr.net" />` + tossface css `<link>`.
- `globals.css`: 본문/디스플레이 폰트 스택 끝에 `"Tossface"` 추가. 강제용 `.emoji { font-family:"Tossface"; font-style:normal; line-height:1; }`도 정의.

### sitemap.ts / robots.ts — (3)
- `nextSitemap("[URL]", [{ path:"/", priority:1 }, …])`, `nextRobots({ disallow:["/api","/admin"], sitemap:"[URL]/sitemap.xml" })`.
- `app/` 하위 `page.tsx`를 스캔해 경로 자동 추출, 동적 라우트는 TODO 주석.

### OG 이미지 — (5)
- `app/og/route.tsx`에서 `OGImage`(`@m1kapp/kit/ogimage`) + `loadPretendard()`로 `ImageResponse` 반환.
- 템플릿: 기본 `default`, 대결/스포츠성은 `match`(home/away), 통계는 `stat` 등 앱 성격에 맞게.

### PWA manifest — (4)
- `app/manifest.ts`: `createManifest({ name, themeColor:"[색]", icon:{ text:"[약자]" } })` (default export).

### globals.css 테마 컬러
- Tailwind v4면 `@theme inline`에 `--color-primary: var(--primary)`, `:root`에 `--primary:[hex]`. v3면 `tailwind.config`.

---

## Step 4: 완료 요약 + 검증

```
🎉 설정 완료!  적용: layout / AppRoot / page / globals / sitemap / robots / manifest / og

다음 단계:
  → npm run build 로 타입/라우트 검증 (반드시 프로젝트 루트에서!)
  → npm run dev 로 앱쉘·카운트다운 등 실제 화면 확인
  → npx m1kkit favicon 으로 파비콘 생성
  → 배포 후 search.google.com/search-console 등록
```
- 마무리로 **프로젝트 루트에서** `npm run build`를 돌려 타입 에러/모듈 누락이 없는지 확인하고 결과를 보고한다.

---

## 주의사항
- 기존 코드를 덮어쓸 때는 원본을 보존하며 필요한 부분만 추가/수정. 파일이 이미 있으면 사용자에게 알리고 확인.
- TypeScript 타입 에러 없이 마치고, 가능하면 빌드까지 통과시킨 뒤 보고.
- `styles.css` import 누락 / `Watermark` 미적용 / 빌드를 kit 디렉토리에서 돌리는 것 — 이 셋이 가장 흔한 실패 원인이다. (위 핵심 규칙 참조)
