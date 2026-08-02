#!/usr/bin/env node
/**
 * m1kkit track <url> [--host=m1k.app] [--write]
 *
 * 로그인 없이 m1k 방문자 트래커에 사이트를 등록하고 배지 slug를 발급받는다.
 * 발급된 claim 토큰은 현재 폴더의 .m1k.json 에 저장 → 나중에 `m1kkit claim`으로 계정 귀속.
 * `--write` 를 주면 발급된 slug를 앱 코드(`<Watermark trackSlug>`)와 `.env` 에 직접 꽂는다.
 */
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const { detectProject, wireSlug } = await import(
  join(dirname(fileURLToPath(import.meta.url)), "lib", "project.mjs")
);

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith("--")).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const positional = args.filter((a) => !a.startsWith("--"));
const url = positional[0];
const host = flags.host || process.env.M1K_HOST || "m1k.app";

if (!url || flags.help) {
  console.log(`
m1kkit track — m1k 방문자 트래커에 사이트 등록 (무로그인)

사용법:
  npx m1kkit track <url> [--host=m1k.app] [--write]

예시:
  npx m1kkit track https://myside.app
  npx m1kkit track https://myside.app --write    # 발급 + 코드에 바로 배선

동작:
  1) 로그인 없이 사이트를 등록하고 배지 slug를 발급
  2) 배지 스니펫을 출력 (README/푸터에 붙여넣기 → 바로 수집 시작)
  3) claim 토큰을 ./.m1k.json 에 저장 → 나중에 'm1kkit claim'으로 내 계정에 귀속

옵션:
  --write   slug를 <Watermark trackSlug="..."> 에 직접 넣고 .env 에도 기록.
            (이걸 안 쓰면 slug만 발급되고 앱에는 아무것도 안 붙는다)
`);
  process.exit(url ? 0 : 1);
}

const scheme = /^(localhost|127\.|0\.0\.0\.0)/.test(host) ? "http" : "https";
const base = `${scheme}://${host}`;
const endpoint = `${base}/api/sites/cli`;
let res, data;
try {
  res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  data = await res.json().catch(() => ({}));
} catch (e) {
  console.error(`✗ 등록 요청 실패: ${e.message}`);
  process.exit(1);
}

if (!res.ok) {
  console.error(`✗ ${data?.error || data?.message || res.statusText}`);
  process.exit(1);
}

const cwd = process.cwd();

/** slug를 앱에 꽂고, 무엇을 건드렸는지 사람 읽을 수 있게 출력한다. */
function applyWire(slug) {
  const r = wireSlug(cwd, slug);
  if (r.patched && !r.alreadyWired) console.log(`  ✓ ${r.patched} — <Watermark trackSlug="${slug}"> 추가`);
  else if (r.alreadyWired) console.log(`  · ${r.patched} — trackSlug가 이미 있어 건너뜀`);
  else console.log(`  ! <Watermark> 를 쓰는 파일을 못 찾음 — trackSlug="${slug}" 를 직접 넣어주세요`);
  if (r.env) console.log(`  ✓ .env — ${r.env.key}=${slug} (${r.env.action})`);
  console.log(`  → dev 서버를 돌리는 중이면 재시작해야 .env가 반영됩니다.`);
  return r;
}

if (data.alreadyRegistered) {
  console.log(`\n⚠ ${data.message}`);
  console.log(`  slug:  ${data.slug}`);
  console.log(`  badge: ${data.badgeUrl}\n`);
  if (flags.write) applyWire(data.slug);
  else console.log(`  코드에 배선하려면:  npx m1kkit track ${url} --write\n`);
  process.exit(0);
}

// .m1k.json 저장 (기존 있으면 병합)
const file = resolve(process.cwd(), ".m1k.json");
let store = {};
if (existsSync(file)) {
  try { store = JSON.parse(readFileSync(file, "utf8")); } catch { /* ignore */ }
}
store.host = host;
store.slug = data.slug;
store.url = data.url;
store.claimToken = data.claimToken;
writeFileSync(file, JSON.stringify(store, null, 2) + "\n");

console.log(`
✓ 등록 완료!  ${data.url}

  배지 스니펫 (README/푸터에 붙여넣기):
  ${data.snippet}
`);

if (flags.write) {
  console.log(`  ⚡ kit 자동 집계 배선:`);
  applyWire(data.slug);
} else {
  // 프로젝트 종류에 따라 env 변수 이름이 다르다. 반대쪽 이름을 쓰면 에러 없이
  // 조용히 무시되기만 해서 "붙인 줄 알았는데 0" 이 되므로, 감지해서 알려준다.
  const { kind } = detectProject(cwd);
  const hint =
    kind === "next"
      ? `Next 감지 → .env 에  NEXT_PUBLIC_M1K_SLUG=${data.slug}  (kit이 알아서 읽음)`
      : kind === "vite"
        ? `Vite 감지 → .env 에  VITE_M1K_SLUG=${data.slug}
       + 앱 소스에  <Watermark trackSlug={import.meta.env.VITE_M1K_SLUG}>
       (Vite는 import.meta.env 를 앱 소스에서만 치환한다 — kit 안에서는 못 읽음)`
        : `Next면  .env 에 NEXT_PUBLIC_M1K_SLUG=${data.slug}
       Vite면  .env 에 VITE_M1K_SLUG=${data.slug} + 앱 소스에서 trackSlug 로 전달`;
  console.log(`  ⚡ kit을 쓰면 스니펫 없이 자동 집계:
     ${hint}

     제일 확실한 방법(번들러 무관):  <Watermark trackSlug="${data.slug}">
     (끄려면: <Watermark track={false}> 또는 그 줄 삭제)

  ↳ 위를 대신 해주는 명령:  npx m1kkit track ${url} --write
`);
}

console.log(`
  claim 토큰을 ./.m1k.json 에 저장했어요.
  나중에 내 계정에 귀속하려면:  npx m1kkit claim

  바로 귀속:  ${data.claimUrl}
`);
