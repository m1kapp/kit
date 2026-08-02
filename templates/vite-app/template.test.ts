import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * `m1kkit new` 가 복사하는 템플릿의 회귀 방지.
 *
 * 여기 걸린 항목은 전부 실제로 한 번씩 깨졌던 것들이다 — 산문으로 된 스킬이
 * 매번 코드를 다시 타이핑하던 시절에 빌드가 안 되거나 화면이 비어 나왔다.
 */
const DIR = join(__dirname);
const read = (rel: string) => readFileSync(join(DIR, rel), "utf8");

describe("vite-app template", () => {
  it("ships vite-env.d.ts — 없으면 import './index.css' 가 tsc에서 TS2307", () => {
    expect(existsSync(join(DIR, "src/vite-env.d.ts"))).toBe(true);
    expect(read("src/vite-env.d.ts")).toContain('types="vite/client"');
  });

  it("themeColor는 string으로 넓혀둔다 — 리터럴이면 ThemeDialog onSelect가 TS2322", () => {
    expect(read("src/App.tsx")).toContain("useState<string>(");
  });

  it("트래커 slug는 앱 소스에서 넘긴다 — Vite는 kit 내부의 import.meta.env를 치환하지 않음", () => {
    expect(read("src/App.tsx")).toContain("trackSlug={import.meta.env.VITE_M1K_SLUG}");
  });

  it("첫 화면이 비어 있지 않다 — TODO 주석만 남기고 끝내지 않기", () => {
    const app = read("src/App.tsx");
    for (const c of ["TabBar", "StatChip", "ListRow", "EmptyState", "Fab", "Divider"]) {
      expect(app, `${c} 가 첫 화면에 있어야 함`).toContain(`<${c}`);
    }
    expect(app).not.toMatch(/\{\s*\/\*\s*TODO/);
  });

  it("좌측 컬러 스트라이프를 기본으로 쓰지 않는다 — 'side-stripe card'는 알려진 생성형 UI 티", () => {
    const app = read("src/App.tsx");
    expect(app).not.toMatch(/<ListRow[^>]*\sbar\b/);
    expect(app).not.toMatch(/border-l-\d/);
  });

  it("앱쉘 트리를 Watermark로 감싼다 — 빠지면 높이가 콘텐츠만큼 쪼그라들고 크레딧도 안 뜸", () => {
    const app = read("src/App.tsx");
    expect(app.indexOf("<Watermark")).toBeLessThan(app.indexOf("<AppShell"));
    expect(app).toContain("<AppShellHeader>");
    expect(app).toContain("<AppShellContent>");
  });

  it("Pretendard + Tossface를 둘 다 건다", () => {
    const html = read("index.html");
    expect(html).toContain("tossface");
    expect(html).toContain("pretendardvariable-dynamic-subset");
    // Tossface는 스택 맨 뒤 — 이모지 코드포인트만 여기로 떨어진다
    expect(read("src/index.css")).toMatch(/sans-serif,\s*"Tossface"/);
  });

  it("치환 플레이스홀더가 전부 실제로 쓰인다", () => {
    const all = ["_package.json", "index.html", "src/App.tsx"].map(read).join("\n");
    for (const key of ["__APP_NAME__", "__TITLE__", "__DESC__", "__COLOR__"]) {
      expect(all, `${key} 를 쓰는 파일이 없음`).toContain(key);
    }
  });

  it("npm pack이 특수 취급하는 파일은 밑줄 접두사로 둔다", () => {
    expect(existsSync(join(DIR, "_gitignore"))).toBe(true);
    expect(existsSync(join(DIR, "_package.json"))).toBe(true);
    expect(existsSync(join(DIR, "package.json"))).toBe(false);
  });
});
