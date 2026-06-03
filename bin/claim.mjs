#!/usr/bin/env node
/**
 * m1kkit claim [--token=xxx] [--host=m1k.app] [--no-stats]
 *
 * 익명 등록한 사이트를 내 계정에 귀속한다.
 * claim은 로그인(브라우저 세션)이 필요하므로, 토큰을 들고 브라우저의 claim 페이지를 연다.
 * 토큰은 --token 또는 ./.m1k.json 에서 읽는다.
 * 귀속하는 김에 'stats' 분석도 같이 돌려 kit이 얼마나 아껴줬는지 보여준다 (--no-stats 로 끔).
 */
import { existsSync, readFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { exec, spawnSync } from "child_process";

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith("--")).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

let token = flags.token;
let host = flags.host || process.env.M1K_HOST || "m1k.app";

if (!token) {
  const file = resolve(process.cwd(), ".m1k.json");
  if (existsSync(file)) {
    try {
      const store = JSON.parse(readFileSync(file, "utf8"));
      token = store.claimToken;
      host = flags.host || store.host || host;
    } catch { /* ignore */ }
  }
}

if (!token || flags.help) {
  console.log(`
m1kkit claim — 익명 등록 사이트를 내 계정에 귀속

사용법:
  npx m1kkit claim [--token=<claimToken>] [--host=m1k.app] [--no-stats]

토큰을 안 주면 현재 폴더의 ./.m1k.json 에서 읽어요.
귀속은 로그인이 필요해서 브라우저의 claim 페이지를 엽니다.
귀속하는 김에 코드 분석(stats)도 같이 돌려 kit이 얼마나 아껴줬는지 보여줘요. (--no-stats 로 끔)
`);
  process.exit(token ? 0 : 1);
}

const scheme = /^(localhost|127\.|0\.0\.0\.0)/.test(host) ? "http" : "https";
const claimUrl = `${scheme}://${host}/claim?token=${encodeURIComponent(token)}`;
console.log(`\n브라우저에서 로그인 후 귀속하세요:\n  ${claimUrl}\n`);

// 플랫폼별 브라우저 열기 (실패해도 URL은 위에 출력됨)
const opener =
  process.platform === "darwin" ? "open" :
  process.platform === "win32" ? 'start ""' :
  "xdg-open";
exec(`${opener} "${claimUrl}"`, (err) => {
  if (err) console.log("(브라우저 자동 실행 실패 — 위 URL을 직접 열어주세요)");
});

// 인증하는 김에 — 이 프로젝트에서 kit이 얼마나 아껴줬는지 같이 분석 (--no-stats 로 끔)
if (!flags["no-stats"]) {
  const here = dirname(fileURLToPath(import.meta.url));
  console.log("\n📊 그리고 — 이 프로젝트에서 kit이 얼마나 아껴줬는지 볼게요 👇\n");
  const statsArgs = [join(here, "stats.mjs")];
  if (typeof flags.dir === "string") statsArgs.push(`--dir=${flags.dir}`);
  if (typeof flags.out === "string") statsArgs.push(`--out=${flags.out}`);
  const r = spawnSync(process.execPath, statsArgs, { stdio: "inherit" });
  if (r.status !== 0) {
    console.log("\n(분석은 건너뛰었어요 — 나중에 'npx m1kkit stats' 로 직접 실행할 수 있어요)");
  } else {
    console.log("\n✓ 분석 결과는 kit-stats.json 에 저장됐고, 하단 'powered by' 크레딧 시트에서도 보여요.");
  }
}
