#!/usr/bin/env node
/**
 * m1kkit untrack [slug] [--token=<claimToken>] [--bearer=<개인토큰>] [--host=m1k.app] [--yes]
 *
 * m1k 방문자 트래커에서 사이트 등록을 취소한다(삭제).
 *
 * `track`으로 잘못 등록했을 때 지울 방법이 없었다 — 대시보드 삭제는 브라우저
 * 로그인이 필요하고, CLI로 익명 등록한 사이트는 아직 어느 계정에도 안 붙어
 * 있어서 대시보드에 뜨지도 않는다. 그래서 claim 토큰으로 지운다.
 *
 * slug/토큰을 안 주면 현재 폴더의 ./.m1k.json 에서 읽는다.
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";

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

const store = readStore();
const slug = positional[0] || store.slug;
const claimToken = flags.token || store.claimToken;
const bearer = flags.bearer || process.env.M1K_TOKEN;
const host = flags.host || store.host || process.env.M1K_HOST || "m1k.app";

if (!slug || flags.help) {
  console.log(`
m1kkit untrack — 방문자 트래커에서 사이트 삭제

사용법:
  npx m1kkit untrack [slug] [옵션]

  slug를 안 주면 현재 폴더의 ./.m1k.json 에서 읽어요.

옵션:
  --token=<claimToken>  미귀속 사이트용. 기본값은 ./.m1k.json 의 claimToken
  --bearer=<개인토큰>    이미 내 계정에 귀속한 사이트용 (또는 M1K_TOKEN 환경변수)
  --host=m1k.app
  --yes                 확인 없이 삭제

되돌릴 수 없어요 — 누적 방문 기록도 같이 지워집니다.
`);
  process.exit(slug ? 0 : 1);
}

if (!claimToken && !bearer) {
  console.error(`✗ 인증 수단이 없어요.
  미귀속 사이트면  --token=<claimToken>  (./.m1k.json 에 있어요)
  귀속한 사이트면  --bearer=<개인토큰>`);
  process.exit(1);
}

const scheme = /^(localhost|127\.|0\.0\.0\.0)/.test(host) ? "http" : "https";
const base = `${scheme}://${host}`;

if (!flags.yes && process.stdin.isTTY) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((res) =>
    rl.question(`'${slug}' 를 삭제할까요? 누적 방문 기록도 같이 지워지고 되돌릴 수 없어요. (y/N): `, res),
  );
  rl.close();
  if (!/^y(es)?$/i.test(answer.trim())) {
    console.log("취소했어요.");
    process.exit(0);
  }
}

let res, data;
try {
  res = await fetch(`${base}/api/sites/cli`, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify({ slug, claimToken }),
  });
  data = await res.json().catch(() => ({}));
} catch (e) {
  console.error(`✗ 삭제 요청 실패: ${e.message}`);
  process.exit(1);
}

if (!res.ok) {
  console.error(`✗ ${data?.error || data?.message || res.statusText}`);
  process.exit(1);
}

console.log(`\n✓ 삭제했어요.  ${data.url || slug}\n`);
clearStore(slug);

/** ./.m1k.json 읽기 (없거나 깨졌으면 빈 객체) */
function readStore() {
  const file = resolve(process.cwd(), ".m1k.json");
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

/**
 * 지운 사이트를 가리키던 ./.m1k.json 을 정리한다 — 남겨두면 다음 `claim`이
 * 죽은 토큰으로 브라우저를 연다. 다른 사이트를 가리키고 있으면 건드리지 않는다.
 */
function clearStore(deletedSlug) {
  const file = resolve(process.cwd(), ".m1k.json");
  if (!existsSync(file)) return;
  let json;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return;
  }
  if (json.slug !== deletedSlug) return;

  const rest = { ...json };
  delete rest.slug;
  delete rest.url;
  delete rest.claimToken;
  if (Object.keys(rest).length === 0) {
    unlinkSync(file);
    console.log("  ./.m1k.json 도 지웠어요.");
  } else {
    writeFileSync(file, JSON.stringify(rest, null, 2) + "\n");
    console.log("  ./.m1k.json 에서 해당 항목을 지웠어요.");
  }

  console.log(`  App.tsx 의 trackSlug / .env 의 *_M1K_SLUG 는 직접 지워주세요.\n`);
}
