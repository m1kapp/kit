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
프로젝트 용도에 맞는 최소한의 AppShell 구조:
```tsx
import { useState, useEffect } from "react";
import {
  AppShell, AppShellHeader, AppShellContent,
  colors, ThemeButton, ThemeDialog,
} from "@m1kapp/kit";

export default function App() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <AppShell>
        <AppShellHeader>
          <프로젝트명>
          <ThemeButton dark={dark} onClick={() => setThemeOpen(true)} />
        </AppShellHeader>
        <AppShellContent>
          {/* TODO */}
        </AppShellContent>
      </AppShell>
      <ThemeDialog
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        dark={dark}
        onDarkChange={setDark}
        themeColor={colors.blue}
        onThemeChange={() => {}}
      />
    </>
  );
}
```

### `.gitignore`
```
node_modules
dist
.env
.env.local
```

## 실행 절차

1. 위 파일들을 모두 생성
2. 해당 디렉토리에서 `npm install` 실행
3. `git init` 및 첫 커밋 준비 (커밋은 사용자 확인 후 진행)
4. 완료 후 `npm run dev`로 실행 방법 안내

추가 컨텍스트: $ARGUMENTS
