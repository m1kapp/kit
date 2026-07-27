#!/usr/bin/env node
/**
 * m1kkit stats — 코드 분석을 fixearly 에 위임한다.
 *
 * 예전엔 이 파일이 분석 엔진 956줄을 직접 들고 있었다. 같은 엔진이 fixearly 로 분리되면서
 * 두 벌이 각자 늙기 시작했다(kit 사본은 등급 A+~D 시절에 멈춰 있었다). 엔진은 한 벌만 둔다.
 *
 * 해석 순서:
 *   ① 프로젝트에 설치된 fixearly (node_modules)
 *   ② 없으면 npx 로 최신판 실행 (첫 실행만 네트워크)
 *
 * kit 사용 현황은 --kit 로 켜서 넘긴다 — m1kkit stats 의 존재 이유가 그 집계다.
 *
 * Usage:
 *   m1kkit stats                    # src/ 기준 분석 + kit 사용 현황
 *   m1kkit stats --dir=app          # 특정 디렉토리
 *   m1kkit stats --out=public       # 출력 위치
 *   m1kkit stats --report           # 한 장짜리 HTML 리포트
 *   m1kkit stats --hotspots         # 복잡도 × 변경빈도 = 먼저 고칠 파일
 */

import { spawn } from "child_process";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const passthrough = process.argv.slice(2);
const args = passthrough.includes("--kit") ? passthrough : [...passthrough, "--kit"];

/** node_modules 에 설치된 fixearly 진입점. 없으면 null. */
function resolveLocalEngine() {
  for (const spec of ["fixearly/bin/fixearly.mjs", "fixearly"]) {
    try {
      const p = require.resolve(spec, { paths: [process.cwd()] });
      return p.endsWith(".mjs") ? p : path.join(path.dirname(p), "bin", "fixearly.mjs");
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

const local = resolveLocalEngine();
if (!local) {
  console.log("  fixearly 가 설치돼 있지 않아 npx 로 받아 실행합니다 (npm i -D fixearly 하면 빨라져요)\n");
}

const [cmd, cmdArgs] = local
  ? [process.execPath, [local, ...args]]
  : ["npx", ["-y", "fixearly@latest", ...args]];

const child = spawn(cmd, cmdArgs, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(`  분석 실행 실패: ${err.message}`);
  console.error("  수동 실행: npx fixearly --dir=src --kit");
  process.exit(1);
});
