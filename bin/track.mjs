#!/usr/bin/env node
/**
 * m1kkit track <url> [--host=m1k.app]
 *
 * 로그인 없이 m1k 방문자 트래커에 사이트를 등록하고 배지 slug를 발급받는다.
 * 발급된 claim 토큰은 현재 폴더의 .m1k.json 에 저장 → 나중에 `m1kkit claim`으로 계정 귀속.
 */
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

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
  npx m1kkit track <url> [--host=m1k.app]

예시:
  npx m1kkit track https://myside.app

동작:
  1) 로그인 없이 사이트를 등록하고 배지 slug를 발급
  2) 배지 스니펫을 출력 (README/푸터에 붙여넣기 → 바로 수집 시작)
  3) claim 토큰을 ./.m1k.json 에 저장 → 나중에 'm1kkit claim'으로 내 계정에 귀속
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

if (data.alreadyRegistered) {
  console.log(`\n⚠ ${data.message}`);
  console.log(`  slug:  ${data.slug}`);
  console.log(`  badge: ${data.badgeUrl}\n`);
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

  ⚡ kit을 쓰면 스니펫 없이 자동 집계:
     .env 에 한 줄만 추가하면 Watermark/PoweredByKit 하단 크레딧이 방문을 자동으로 셉니다.
       NEXT_PUBLIC_M1K_SLUG=${data.slug}
     (끄려면: <Watermark track={false}> 또는 그 줄 삭제)

  claim 토큰을 ./.m1k.json 에 저장했어요.
  나중에 내 계정에 귀속하려면:  npx m1kkit claim

  바로 귀속:  ${data.claimUrl}
`);
