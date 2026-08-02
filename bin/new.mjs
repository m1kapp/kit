#!/usr/bin/env node
/**
 * m1kkit new <name> [--color=#hex] [--title=..] [--desc=..] [--url=..]
 *                   [--no-install] [--yes]
 *
 * 검증된 템플릿을 복사해서 새 Vite + @m1kapp/kit 앱을 만든다.
 *
 * 스킬(LLM이 산문을 읽고 매번 코드를 다시 타이핑하는 방식)이 반복해서 깨뜨렸던
 * 것들 — `useState(colors.blue)` 리터럴 협착, `vite-env.d.ts` 누락, TODO 주석만
 * 남은 빈 화면 — 을 파일로 고정해두고 그대로 복사한다.
 */
import { readdirSync, statSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname, resolve, basename } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { createInterface } from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { wireSlug } = await import(join(__dirname, "lib", "project.mjs"));

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    }),
);
const positional = args.filter((a) => !a.startsWith("--"));

if (flags.help) {
  console.log(`
m1kkit new — 새 m1kapp 앱 만들기 (Vite + React + @m1kapp/kit)

사용법:
  npx m1kkit new <이름> [옵션]

옵션:
  --title=<이름>    화면/타이틀에 뜰 이름 (기본: <이름>)
  --desc=<한줄>     한 줄 설명 (meta description)
  --color=#3B82F6   테마 컬러
  --url=<배포URL>   있으면 방문자 트래커를 지금 등록하고 코드에 배선
  --slug=<slug>     이미 발급받은 slug — 재등록 없이 배선만
  --no-install      npm install 건너뛰기
  --yes             질문 없이 기본값으로 진행

예시:
  npx m1kkit new moodlog
  npx m1kkit new moodlog --color=#e2603f --url=https://moodlog.m1k.app
`);
  process.exit(0);
}

const TEMPLATE = join(__dirname, "..", "templates", "vite-app");
if (!existsSync(TEMPLATE)) {
  console.error(`✗ 템플릿을 못 찾음: ${TEMPLATE}`);
  process.exit(1);
}

/* ── 아주 약한 grill: 4문항, 전부 기본값 있음 ─────────────────────────── */

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, fallback) =>
  new Promise((res) => {
    if (flags.yes || !process.stdin.isTTY) return res(fallback);
    rl.question(`${q}${fallback ? ` (${fallback})` : ""}: `, (a) => res(a.trim() || fallback));
  });

const name = positional[0] || (await ask("앱 이름(폴더명)", "my-m1kapp"));
const title = flags.title || (await ask("화면에 뜰 이름", name));
const desc = flags.desc || (await ask("한 줄 설명", `${title} — m1kapp으로 만든 사이드 프로젝트`));
const color = flags.color || (await ask("테마 컬러(hex)", "#3B82F6"));
const url = flags.url || (await ask("배포 URL — 지금 알면 방문자 트래커를 바로 붙임(없으면 엔터)", ""));
rl.close();

if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)) {
  console.error(`✗ 테마 컬러가 hex가 아님: ${color}`);
  process.exit(1);
}

const target = resolve(process.cwd(), name);
if (existsSync(target) && readdirSync(target).length > 0) {
  console.error(`✗ 이미 있고 비어있지 않은 폴더: ${target}`);
  process.exit(1);
}

/* ── 템플릿 복사 + 치환 ──────────────────────────────────────────────── */

const SUBST = {
  __APP_NAME__: basename(name),
  __TITLE__: title,
  __DESC__: desc,
  __COLOR__: color,
};
const TEXT_EXT = /\.(tsx?|jsx?|css|html|json|md)$/;
// npm pack 이 `.gitignore` / 중첩 `package.json` 을 특수 취급하므로 템플릿에는
// 밑줄 접두사로 넣어두고 복사할 때 되돌린다.
const RENAME = { _gitignore: ".gitignore", _package_json: "package.json", "_package.json": "package.json" };

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const src = join(from, entry);
    const dst = join(to, RENAME[entry] ?? entry);
    if (statSync(src).isDirectory()) {
      copyTree(src, dst);
      continue;
    }
    let content = readFileSync(src, TEXT_EXT.test(entry) || RENAME[entry] ? "utf8" : null);
    if (typeof content === "string") {
      for (const [k, v] of Object.entries(SUBST)) content = content.split(k).join(v);
    }
    writeFileSync(dst, content);
  }
}

copyTree(TEMPLATE, target);
console.log(`\n✓ ${name}/ 생성 완료`);

/* ── 설치 ────────────────────────────────────────────────────────────── */

const run = (cmd, cmdArgs) =>
  spawnSync(cmd, cmdArgs, { cwd: target, stdio: "inherit", shell: process.platform === "win32" });

if (!flags["no-install"]) {
  console.log(`\n› npm install …`);
  const r = run("npm", ["install"]);
  if (r.status !== 0) {
    console.error(`\n✗ npm install 실패 — ${target} 에서 직접 다시 돌려주세요.`);
    process.exit(1);
  }
}

/* ── 방문자 트래커 배선 ──────────────────────────────────────────────── */

if (flags.slug) {
  // 이미 발급받은 slug가 있는 경우 — 재등록 없이 배선만.
  const r = wireSlug(target, flags.slug);
  console.log(`\n✓ 트래커 배선: ${r.patched ?? "(Watermark 파일 못 찾음)"} + .env`);
} else if (url) {
  console.log(`\n› 방문자 트래커 등록 …`);
  const r = run("npx", ["m1kkit", "track", url, "--write"]);
  if (r.status !== 0) {
    console.log(`  ! 등록 실패 — 나중에:  npx m1kkit track ${url} --write`);
  }
} else {
  console.log(`
  · 방문자 트래커는 아직 안 붙었습니다(배포 URL 미정).
    배포하고 나서 프로젝트 폴더에서 딱 한 줄:
      npx m1kkit track <배포URL> --write`);
}

console.log(`
다음 단계:
  cd ${name}
  npm run dev

  npm run build      타입 + 번들 검증
  npx m1kkit favicon 파비콘 생성
  npx m1kkit claim   트래커를 내 계정에 귀속
`);
