---
name: m1kapp-pwa
description: "PWA 설정을 점검하고 @m1kapp/kit/pwa 유틸로 자동 적용합니다."
---

현재 Next.js 프로젝트의 PWA 설정을 점검하고 빠진 항목을 채운다.

## Step 1: PWA 현황 파악

다음을 확인한다:
- `app/manifest.ts` 또는 `public/manifest.json` 존재 여부
- `app/viewport.ts` 또는 layout의 viewport 설정
- 아이콘: `public/icon-192.png`, `public/icon-512.png` 여부
- `public/favicon.ico` 여부
- 설치 유도 버튼 (`useInstallPrompt`) 사용 여부

---

## Step 2: 결과 리포트

```
PWA 설정 현황

✓ 완료
  ✓ ...

✗ 미설정
  ✗ app/manifest.ts
  ✗ 아이콘 (192×192, 512×512)
  ...
```

---

## Step 3: 보완

빠진 항목에 대해 확인 후 적용한다.

아이콘이 없으면: `npx m1kkit favicon` 명령어 안내
manifest가 없으면: 앱 이름, 테마 컬러를 물어보고 `createManifest` 적용
viewport가 없으면: `mobileViewport` 적용

```ts
// app/manifest.ts
import { createManifest } from "@m1kapp/kit/pwa"

export default function manifest() {
  return createManifest({
    name: "[앱 이름]",
    short_name: "[앱 이름]",
    theme_color: "[테마 컬러]",
  })
}
```

완료 후:
```
✓ PWA 설정 완료

  → 크롬에서 주소창 우측 설치 버튼 확인
  → Lighthouse PWA 탭에서 점수 확인
```
