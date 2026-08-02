/**
 * 프로젝트 종류 감지 + 트래커 slug 배선.
 *
 * `m1kkit track --write` 와 `m1kkit new` 가 공유한다. 둘 다 "slug를 발급받는 것"
 * 까지는 쉬운데 "그 slug를 앱 코드에 꽂는 것"이 지금까지 비어 있던 단계라,
 * 그 한 단계를 여기 한 곳에 모아둔다.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".next", ".git", "coverage", ".vercel"]);
const CODE_EXT = /\.(tsx|jsx)$/;

/**
 * Vite / Next 중 무엇인지 판별한다. env 변수 이름이 서로 달라서(그리고 서로의
 * 이름을 쓰면 조용히 무시되기만 해서) 안내문과 .env 배선이 갈린다.
 */
export function detectProject(cwd = process.cwd()) {
  const has = (f) => existsSync(join(cwd, f));
  const pkgPath = join(cwd, "package.json");
  let deps = {};
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      deps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      /* 깨진 package.json — 파일 존재 여부로만 판별 */
    }
  }

  const isVite =
    has("vite.config.ts") || has("vite.config.js") || has("vite.config.mjs") || !!deps.vite;
  const isNext = has("next.config.ts") || has("next.config.js") || has("next.config.mjs") || !!deps.next;

  // 둘 다면 Next 우선 — Next 프로젝트가 vite를 도구로 물고 있는 경우가 더 흔하다.
  if (isNext) return { kind: "next", envVar: "NEXT_PUBLIC_M1K_SLUG" };
  if (isVite) return { kind: "vite", envVar: "VITE_M1K_SLUG" };
  return { kind: "unknown", envVar: null };
}

/** `<Watermark` 를 쓰는 첫 소스 파일을 찾는다. */
export function findWatermarkFile(cwd = process.cwd()) {
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return null;
    }
    for (const name of entries) {
      if (SKIP_DIRS.has(name) || name.startsWith(".")) continue;
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (CODE_EXT.test(name)) {
        let src;
        try {
          src = readFileSync(full, "utf8");
        } catch {
          continue;
        }
        if (src.includes("<Watermark")) return full;
      }
    }
    return null;
  };
  return walk(cwd);
}

/** `.env` 에 `KEY=value` 를 병합한다(기존 키는 덮어씀). */
export function upsertEnv(cwd, key, value) {
  const file = join(cwd, ".env");
  const line = `${key}=${value}`;
  if (!existsSync(file)) {
    writeFileSync(file, line + "\n");
    return { file, action: "created" };
  }
  const src = readFileSync(file, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(src)) {
    if (src.match(re)[0] === line) return { file, action: "unchanged" };
    writeFileSync(file, src.replace(re, line));
    return { file, action: "updated" };
  }
  writeFileSync(file, src.endsWith("\n") ? src + line + "\n" : src + "\n" + line + "\n");
  return { file, action: "appended" };
}

/**
 * slug를 앱에 실제로 연결한다. `.env` 기록 + `<Watermark>` 패치를 둘 다 한다.
 *
 * `<Watermark>` 에 이미 `trackSlug` 가 있으면(템플릿이 심어둔
 * `trackSlug={import.meta.env.VITE_M1K_SLUG}` 포함) 건드리지 않고 `.env` 만 쓴다.
 * 없으면 문자열 리터럴을 박는다 — 번들러 종류와 무관하게 항상 동작하는 유일한
 * 형태라서다. (Vite는 `import.meta.env` 를 앱 소스에서만 치환하므로 kit 내부
 * 폴백은 존재할 수 없고, 남의 프로젝트 구조를 가정할 수도 없다.)
 * slug 자체는 공개값이라 하드코딩해도 문제없다.
 */
export function wireSlug(cwd, slug, { envOnly = false } = {}) {
  const project = detectProject(cwd);
  const report = { kind: project.kind, patched: null, env: null, alreadyWired: false };

  if (project.envVar) report.env = { ...upsertEnv(cwd, project.envVar, slug), key: project.envVar };

  if (envOnly) return report;

  const file = findWatermarkFile(cwd);
  if (!file) return report;

  const src = readFileSync(file, "utf8");
  if (/<Watermark[^>]*\btrackSlug=/.test(src)) {
    report.alreadyWired = true;
    report.patched = relative(cwd, file);
    return report;
  }

  const patched = src.replace(/<Watermark(?=[\s>])/, `<Watermark trackSlug="${slug}"`);
  if (patched === src) return report;

  writeFileSync(file, patched);
  report.patched = relative(cwd, file);
  return report;
}
