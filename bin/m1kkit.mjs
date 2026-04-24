#!/usr/bin/env node
/**
 * m1kkit CLI
 *
 * Commands:
 *   m1kkit favicon   — 파비콘 생성
 *   m1kkit skills    — Claude Code 스킬 설치
 */

const [,, command, ...rest] = process.argv;

if (!command || command === "--help" || command === "-h") {
  console.log(`
m1kkit — @m1kapp/kit CLI

Commands:
  m1kkit favicon [options]   파비콘 자동 생성
  m1kkit skills [options]    Claude Code 스킬 설치

Options:
  --help    도움말 보기

Examples:
  m1kkit favicon --text=K --color=#3B82F6
  m1kkit skills
  m1kkit skills --list
  m1kkit skills m1kapp-init
`);
  process.exit(0);
}

// 서브커맨드 위임
const { createRequire } = await import("module");
const { fileURLToPath } = await import("url");
const path = await import("path");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (command === "favicon") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "favicon.mjs"));
} else if (command === "skills") {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  await import(path.join(__dirname, "skills.mjs"));
} else {
  console.error(`알 수 없는 커맨드: ${command}`);
  console.error("사용법: m1kkit --help");
  process.exit(1);
}
