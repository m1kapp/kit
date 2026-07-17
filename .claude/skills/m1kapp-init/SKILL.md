---
name: m1kapp-init
description: 새로운 m1kapp 서비스 프로젝트를 스캐폴딩 — package.json, vite, tailwind, @m1kapp/kit 세팅 포함
---

`$ARGUMENTS` 위치에 새로운 m1kapp 서비스 프로젝트를 생성해줘.

인자가 없으면 사용자에게 프로젝트 이름(디렉토리명)을 물어봐.

## 생성 경로

`/Users/minho/IdeaProjects/m1kapp/<프로젝트명>/`

## 생성할 파일들

### `package.json`
```json
{
  "name": "<프로젝트명>",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@m1kapp/kit": "latest",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.4",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "tailwindcss": "^4.1.4",
    "typescript": "~5.8.3",
    "vite": "^6.3.2"
  }
}
```

### `vite.config.ts`
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

### `index.html`
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><프로젝트 한국어 이름> — m1kapp</title>
    <meta name="description" content="<한줄 설명>" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/index.css`
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

html {
  font-family: "Pretendard Variable", "Pretendard", system-ui, -apple-system, sans-serif, "Tossface";
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### `src/main.tsx`
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `src/App.tsx`

**중요 — kit 앱은 반드시 `Watermark`로 감싸고 `Section`/`Divider`로 화면을 구성한다.**
개별 컴포넌트 prop만 보고 짜지 말 것 — `AppShell` 혼자서는 뷰포트를 안 채운다.
`Watermark`가 `h-dvh` 전체 높이 + 중앙 정렬 + 하단 `PoweredByKit` 크레딧까지 같이 준다
(`Watermark` 없이 `AppShell`만 쓰면 콘텐츠 높이만큼 쪼그라들고 크레딧도 안 뜬다).
`AppShellContent` 내부는 `<Section>`(px-4) 블록을 `<Divider spacing="sm" />`로 구분해
쌓는 게 kit 데모의 표준 리듬이다 — `<div className="p-4 flex flex-col gap-4">` 같은
직접 만든 wrapper 쓰지 말 것.

프로젝트 용도에 맞는 최소한의 구조:
```tsx
import { useEffect, useState } from "react";
import {
  AppShell, AppShellHeader, AppShellContent, Watermark,
  Section, SectionHeader,
  colors, ThemeButton, ThemeDialog,
} from "@m1kapp/kit";

export default function App() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [themeColor, setThemeColor] = useState(colors.blue);

  // `dark:` tailwind variants only fire under a `.dark` ancestor — kit doesn't
  // apply this for you, ThemeDialog just reports/toggles the boolean.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Watermark color={themeColor} text="<프로젝트명>">
      <AppShell accent={themeColor}>
        <AppShellHeader>
          <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            <프로젝트명>
          </span>
          <ThemeButton color={themeColor} dark={dark} onClick={() => setThemeOpen(true)} />
        </AppShellHeader>
        <AppShellContent>
          <Section className="pt-4">
            <SectionHeader>시작하기</SectionHeader>
            {/* TODO — 여기부터 Section + Divider로 화면 구성 */}
          </Section>
        </AppShellContent>
      </AppShell>

      <ThemeDialog
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        current={themeColor}
        onSelect={setThemeColor}
        dark={dark}
        onDarkToggle={() => setDark((d) => !d)}
      />
    </Watermark>
  );
}
```

### `.gitignore`
```
node_modules
dist
.env
.env.local
.m1k.json
```

## 실행 절차

1. 위 파일들을 모두 생성
2. 해당 디렉토리에서 `npm install` 실행
3. `git init` 및 첫 커밋 준비 (커밋은 사용자 확인 후 진행)
4. 완료 후 `npm run dev`로 실행 방법 안내
5. **배포하고 나면 (URL이 생기면) 방문자 트래커를 기본으로 붙인다** —
   `npx m1kkit track <배포된 URL>` 실행 → 발급된 slug를 `App.tsx`의
   `<Watermark trackSlug="...">` 에 직접 지정 (Vite라 `NEXT_PUBLIC_M1K_SLUG`
   env는 안 읽힘). 계정 귀속(`npx m1kkit claim`)은 브라우저 로그인이 필요해서
   나중에 사용자가 직접 해도 됨 — 트래커 연결 자체를 미룰 이유는 아님.

추가 컨텍스트: $ARGUMENTS
