#!/usr/bin/env node
/**
 * m1kkit CLI
 *
 * Commands:
 *   m1kkit favicon   — 파비콘 생성
 *   m1kkit skills    — Claude Code 스킬 설치
 *   m1kkit stats     — 코드 분석 & kit 사용 현황 생성
 */

const [,, command, ...rest] = process.argv;

if (!command || command === "--help" || command === "-h") {
  console.log(`
m1kkit — @m1kapp/kit CLI

Commands:
  m1kkit new <name>          새 앱 생성 (Vite + React + kit 앱쉘 템플릿)
  m1kkit favicon [options]   파비콘 자동 생성
  m1kkit skills [options]    Claude Code 스킬 설치
  m1kkit stats [options]     코드 분석 & kit 사용 현황 생성
  m1kkit track <url>         m1k 방문자 트래커에 사이트 등록(무로그인)
  m1kkit untrack [slug]      등록 취소 — 사이트와 누적 기록 삭제
  m1kkit claim [--token=x]   등록한 사이트를 내 계정에 귀속

Options:
  --help    도움말 보기

Examples:
  m1kkit new moodlog --color=#e2603f
  m1kkit favicon --text=K --color=#3B82F6
  m1kkit skills
  m1kkit skills --list
  m1kkit skills m1kapp-init
  m1kkit stats --dir=src --out=public
  m1kkit track https://myside.app --write
  m1kkit claim
`);
  process.exit(0);
}

// 서브커맨드 위임
const { createRequire } = await import("module");
const { fileURLToPath } = await import("url");
const path = await import("path");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (command === "new") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "new.mjs"));
} else if (command === "favicon") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "favicon.mjs"));
} else if (command === "skills") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "skills.mjs"));
} else if (command === "stats") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "stats.mjs"));
} else if (command === "track") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "track.mjs"));
} else if (command === "untrack") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "untrack.mjs"));
} else if (command === "claim") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "claim.mjs"));
} else {
  console.error(`알 수 없는 커맨드: ${command}`);
  console.error("사용법: m1kkit --help");
  process.exit(1);
}
