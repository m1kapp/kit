#!/usr/bin/env node
/**
 * @m1kapp/kit skills installer
 *
 * Usage:
 *   npx m1kkit skills              — 전체 스킬 설치
 *   npx m1kkit skills --list       — 설치 가능한 스킬 목록
 *   npx m1kkit skills m1kapp-init  — 특정 스킬만 설치
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_SRC = path.join(__dirname, "skills");

const SKILLS = [
  {
    name: "m1kapp-init",
    desc: "/m1kapp-init  — Next.js 프로젝트 초기 설정 인터랙티브 스캐폴딩",
  },
  {
    name: "m1kapp-seo",
    desc: "/m1kapp-seo   — SEO 감사 및 @m1kapp/kit/seo 자동 적용",
  },
  {
    name: "m1kapp-pwa",
    desc: "/m1kapp-pwa   — PWA 설정 점검 및 @m1kapp/kit/pwa 자동 적용",
  },
];

const args = process.argv.slice(2);
const listOnly = args.includes("--list");
const target = args.find((a) => !a.startsWith("--"));

// 설치 대상 디렉토리: 프로젝트 로컬 우선, 없으면 글로벌
function getSkillsDir() {
  const local = path.join(process.cwd(), ".claude", "skills");
  const global = path.join(
    process.env.HOME ?? process.env.USERPROFILE ?? "~",
    ".claude",
    "skills"
  );
  // 프로젝트에 .claude 폴더가 이미 있으면 로컬, 아니면 글로벌
  const hasLocalClaude = fs.existsSync(path.join(process.cwd(), ".claude"));
  return hasLocalClaude ? local : global;
}

if (listOnly) {
  console.log("\n사용 가능한 @m1kapp/kit 스킬:\n");
  for (const s of SKILLS) {
    console.log(`  ${s.desc}`);
  }
  console.log("\n설치: npx m1kkit skills\n");
  process.exit(0);
}

const toInstall = target
  ? SKILLS.filter((s) => s.name === target)
  : SKILLS;

if (target && toInstall.length === 0) {
  console.error(`스킬을 찾을 수 없습니다: ${target}`);
  console.error(`사용 가능: ${SKILLS.map((s) => s.name).join(", ")}`);
  process.exit(1);
}

const skillsDir = getSkillsDir();
fs.mkdirSync(skillsDir, { recursive: true });

console.log(`\n@m1kapp/kit 스킬 설치 중...\n`);
console.log(`설치 위치: ${skillsDir}\n`);

let installed = 0;
for (const skill of toInstall) {
  const src = path.join(SKILLS_SRC, `${skill.name}.md`);
  const destDir = path.join(skillsDir, skill.name);
  const dest = path.join(destDir, "skill.md");

  if (!fs.existsSync(src)) {
    console.log(`  ⚠ ${skill.name} — 소스 파일 없음 (스킵)`);
    continue;
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`  ✓ /${skill.name}`);
  installed++;
}

console.log(`\n${installed}개 스킬 설치 완료!\n`);
console.log("Claude Code에서 바로 사용하세요:\n");
for (const s of toInstall) {
  console.log(`  /${s.name}`);
}
console.log();
