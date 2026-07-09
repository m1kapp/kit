#!/usr/bin/env node
/**
 * m1kkit stats — 프로젝트의 코드량과 kit 사용 현황을 분석해서 .kit-stats.json 생성
 *
 * Usage:
 *   m1kkit stats                    # src/ 기준 분석
 *   m1kkit stats --dir=app          # 특정 디렉토리 기준
 *   m1kkit stats --out=public       # 출력 위치 지정
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";

const args = process.argv.slice(2);
const getFlag = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=")[1] : undefined;
};

const srcDir = path.resolve(process.cwd(), getFlag("dir") || "src");
const outDir = path.resolve(process.cwd(), getFlag("out") || "public");

// kit의 meta.json에서 실제 측정된 LOC 로드
let KIT_FEATURES = {};
let kitVersion = "unknown";
let kitTotalFeatures = { component: 0, hook: 0, util: 0 };

// meta.json 탐색: require.resolve → node_modules 직접 탐색 → 상위 디렉토리
function findMeta() {
  // 1. require.resolve
  try {
    const require = createRequire(path.resolve(process.cwd(), "package.json"));
    return require.resolve("@m1kapp/kit/dist/meta.json");
  } catch {}

  // 2. node_modules에서 직접 탐색
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, "node_modules", "@m1kapp", "kit", "dist", "meta.json");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }

  // 3. 이 스크립트가 kit 안에 있으면 형제 dist/ 탐색
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const siblingMeta = path.join(scriptDir, "..", "dist", "meta.json");
  if (fs.existsSync(siblingMeta)) return siblingMeta;

  return null;
}

const metaPath = findMeta();
if (!metaPath) {
  console.error("  @m1kapp/kit/dist/meta.json을 찾을 수 없습니다.");
  console.error("  kit을 먼저 빌드하거나 npm install 후 다시 시도하세요.\n");
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
KIT_FEATURES = meta.features;
kitVersion = meta.version;

// kit이 제공하는 전체 요소 수 카운트
for (const f of Object.values(meta.features)) {
  kitTotalFeatures[f.category] = (kitTotalFeatures[f.category] || 0) + 1;
}

console.log(`  meta.json 로드 완료 (v${kitVersion}, ${Object.keys(KIT_FEATURES).length}개 요소)\n`);

// 소스 파일 수집
function collectFiles(dir, exts = [".ts", ".tsx", ".js", ".jsx"]) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist" || entry.name.startsWith(".")) continue;
      results.push(...collectFiles(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext)) && !entry.name.endsWith(".d.ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

// 줄 수 카운트 (빈 줄, 주석만 있는 줄 제외)
function countLines(content) {
  const lines = content.split("\n");
  let total = 0;
  let code = 0;
  for (const line of lines) {
    total++;
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/*")) {
      code++;
    }
  }
  return { total, code };
}

// 코드 청결도 분석 — 분기 밀도·파일 크기 기반 휴리스틱 (typescript 미설치 시 폴백)
// 주석/문자열 안까지 세는 러프한 근사지만, 프로젝트 간 상대 비교엔 충분
function analyzeQuality(content) {
  const branchTokens = content.match(/\bif\s*\(|\belse\b|\bcase\s|\bcatch\s*[({]|\?\s*[^.:]|&&|\|\|/g);
  const fnTokens = content.match(/\bfunction\b|=>/g);
  return { branches: branchTokens?.length || 0, functions: fnTokens?.length || 0 };
}

// 프로젝트의 typescript 패키지 로드 (AST 기반 정밀 분석용)
function loadTypescript() {
  try {
    const require = createRequire(path.resolve(process.cwd(), "package.json"));
    return require("typescript");
  } catch {
    return null;
  }
}

// AST 기반 함수별 cyclomatic complexity (McCabe)
// 결정 포인트: if/삼항/case/catch/루프/&&/||/?? — 중첩 함수는 별도 함수로 분리 집계
function analyzeAstComplexity(ts, filePath, content) {
  const kind = /\.(tsx|jsx)$/.test(filePath) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, kind);

  const isFnLike = (n) =>
    ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) ||
    ts.isMethodDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n) || ts.isConstructorDeclaration(n);

  const fnName = (n) => {
    if (n.name) return n.name.getText(sf);
    const p = n.parent;
    if (p && ts.isVariableDeclaration(p)) return p.name.getText(sf);
    if (p && ts.isPropertyAssignment(p)) return p.name.getText(sf);
    return "(anonymous)";
  };

  const ccOf = (fn) => {
    let cc = 1;
    const walk = (n) => {
      if (n !== fn && isFnLike(n)) return; // 중첩 함수는 자기 항목에서 계산
      switch (n.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.ConditionalExpression:
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.CatchClause:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
          cc++;
          break;
        case ts.SyntaxKind.BinaryExpression: {
          const op = n.operatorToken.kind;
          if (
            op === ts.SyntaxKind.AmpersandAmpersandToken ||
            op === ts.SyntaxKind.BarBarToken ||
            op === ts.SyntaxKind.QuestionQuestionToken
          ) cc++;
          break;
        }
      }
      ts.forEachChild(n, walk);
    };
    ts.forEachChild(fn, walk);
    return cc;
  };

  const fns = [];
  const collect = (n) => {
    if (isFnLike(n) && (n.body || ts.isArrowFunction(n))) {
      fns.push({
        name: fnName(n),
        cc: ccOf(n),
        line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
      });
    }
    ts.forEachChild(n, collect);
  };
  collect(sf);
  return fns;
}

// 파일 분류 — frontend(UI) / backend(API·서버) / shared(공용 유틸)
function classifyFile(filePath, content) {
  const rel = filePath.replace(/\\/g, "/");
  const head = content.slice(0, 300);
  if (
    /\/(api|server)\//.test(rel) ||
    /(^|\/)(route|middleware|instrumentation)\.(ts|js|mjs)$/.test(rel) ||
    /^\s*["']use server["']/.test(head)
  ) {
    return "backend";
  }
  if (/\.(tsx|jsx)$/.test(rel) || /^\s*["']use client["']/.test(head)) {
    return "frontend";
  }
  return "shared";
}

// kit import 감지
function detectKitImports(content) {
  const found = new Set();
  // import { X, Y } from "@m1kapp/kit" 또는 "@m1kapp/kit/..." 패턴
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']@m1kapp\/kit(?:\/[^"']*)?["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1].split(",").map((s) => s.trim().split(" as ")[0].trim());
    for (const name of names) {
      if (name && !name.startsWith("type ")) {
        found.add(name);
      }
    }
  }
  // import type은 제외 — 타입만 쓰는 건 코드 절약 아님
  return found;
}

// 실행
console.log(`\n  분석 중... ${srcDir}\n`);

const files = collectFiles(srcDir);
if (files.length === 0) {
  console.error(`  파일을 찾을 수 없습니다: ${srcDir}`);
  process.exit(1);
}

let totalLines = 0;
let codeLines = 0;
let totalBranches = 0;
let totalFunctions = 0;
let maxFile = { path: "", lines: 0 };
let longFiles = 0; // 200줄 초과 파일 수
const allImports = new Set();
const ts = loadTypescript();
const allFns = []; // AST 모드: {name, cc, line, file}
const breakdown = {
  frontend: { files: 0, codeLines: 0 },
  backend: { files: 0, codeLines: 0 },
  shared: { files: 0, codeLines: 0 },
};

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const counts = countLines(content);
  totalLines += counts.total;
  codeLines += counts.code;
  const bucket = breakdown[classifyFile(file, content)];
  bucket.files++;
  bucket.codeLines += counts.code;
  const q = analyzeQuality(content);
  totalBranches += q.branches;
  totalFunctions += q.functions;
  if (ts) {
    const rel = path.relative(process.cwd(), file);
    for (const fn of analyzeAstComplexity(ts, file, content)) allFns.push({ ...fn, file: rel });
  }
  if (counts.code > maxFile.lines) maxFile = { path: path.relative(process.cwd(), file), lines: counts.code };
  if (counts.code > 200) longFiles++;
  const imports = detectKitImports(content);
  for (const imp of imports) allImports.add(imp);
}

const branchDensity = codeLines > 0 ? Math.round((totalBranches / codeLines) * 1000) / 10 : 0;
const avgFileLines = files.length > 0 ? Math.round(codeLines / files.length) : 0;

// 청결도 스코어 (100점 만점)
// AST 모드: 함수별 cyclomatic complexity 기반 — McCabe/SonarQube 관행(CC>10 경고, CC>20 심각) 근거
// 프로젝트 크기 편향 없게 비율 기반 감점:
// - CC>10 함수 비율 ×3 (최대 30), CC>20 함수 비율 ×5 (최대 25)
// - 최악 함수: CC 15 초과분 ×1 (최대 20)
// - 200줄 초과 파일 비율 ×2 (최대 15) / 평균 파일 길이 80줄 초과분 /5 (최대 10)
let qualityScore;
let cc = null;
if (ts && allFns.length > 0) {
  const sorted = [...allFns].sort((a, b) => b.cc - a.cc);
  const over10 = sorted.filter((f) => f.cc > 10);
  const over20 = sorted.filter((f) => f.cc > 20);
  const maxCC = sorted[0].cc;
  const p90 = sorted[Math.floor((sorted.length - 1) * 0.1)].cc; // 상위 10% 경계
  const avgCC = Math.round((allFns.reduce((s, f) => s + f.cc, 0) / allFns.length) * 10) / 10;
  cc = {
    functions: allFns.length,
    avg: avgCC,
    p90,
    max: maxCC,
    over10: over10.length,
    over20: over20.length,
    worst: sorted.slice(0, 5).map(({ name, cc, file, line }) => ({ name, cc, file, line })),
  };
  const over10Pct = (over10.length / allFns.length) * 100;
  const over20Pct = (over20.length / allFns.length) * 100;
  const longFilesPct = (longFiles / files.length) * 100;
  qualityScore = Math.max(0, Math.round(
    100
    - Math.min(30, over10Pct * 3)
    - Math.min(25, over20Pct * 5)
    - Math.min(20, Math.max(0, maxCC - 15))
    - Math.min(15, longFilesPct * 2)
    - Math.min(10, Math.max(0, avgFileLines - 80) / 5)
  ));
} else {
  // regex 폴백 (typescript 미설치)
  qualityScore = Math.max(0, Math.round(
    100
    - Math.min(40, Math.max(0, branchDensity - 10) * 2)
    - Math.min(30, longFiles * 5)
    - Math.min(30, Math.max(0, avgFileLines - 80) / 4)
  ));
}
const qualityGrade = qualityScore >= 90 ? "A+" : qualityScore >= 80 ? "A" : qualityScore >= 70 ? "B" : qualityScore >= 60 ? "C" : "D";

// 절약량 계산
// 같은 소스 파일에서 여러 export를 쓰더라도 파일 LOC는 한 번만 카운트
const usedFeatures = [];
let savedLines = 0;
const usedByCategory = { component: 0, hook: 0, util: 0 };
const countedSources = new Set();

for (const name of allImports) {
  const meta = KIT_FEATURES[name];
  if (!meta) continue;

  // 카테고리별 사용 수 (loc 0이어도 카운트 — "Tab"도 사용한 거니까)
  usedByCategory[meta.category] = (usedByCategory[meta.category] || 0) + 1;

  // LOC 절약은 소스 파일 단위로 1번만. 대표(loc>0)만 카운트하므로 import
  // 순서와 무관 — 비대표(loc 0)가 먼저 와도 source를 선점하지 않는다.
  if (meta.loc > 0 && !(meta.source && countedSources.has(meta.source))) {
    if (meta.source) countedSources.add(meta.source);
    usedFeatures.push({ name, loc: meta.loc, category: meta.category });
    savedLines += meta.loc;
  }
}

const estimatedKB = Math.round(savedLines * 40 / 1024);
const estimatedA4 = Math.round(savedLines / 80);
const savedPercent = codeLines > 0 ? Math.round((savedLines / (codeLines + savedLines)) * 100) : 0;

// 사용률: kit이 제공하는 전체 요소 중 몇 개를 쓰고 있는지
const usage = {
  component: { used: usedByCategory.component, total: kitTotalFeatures.component, percent: kitTotalFeatures.component > 0 ? Math.round((usedByCategory.component / kitTotalFeatures.component) * 100) : 0 },
  hook: { used: usedByCategory.hook, total: kitTotalFeatures.hook, percent: kitTotalFeatures.hook > 0 ? Math.round((usedByCategory.hook / kitTotalFeatures.hook) * 100) : 0 },
  util: { used: usedByCategory.util, total: kitTotalFeatures.util, percent: kitTotalFeatures.util > 0 ? Math.round((usedByCategory.util / kitTotalFeatures.util) * 100) : 0 },
};

const stats = {
  generatedAt: new Date().toISOString(),
  kitVersion,
  source: {
    dir: path.relative(process.cwd(), srcDir),
    files: files.length,
    totalLines,
    codeLines,
    breakdown, // frontend(UI) / backend(API·서버) / shared(공용) 별 files·codeLines
  },
  quality: {
    engine: cc ? "ast" : "regex", // ast = typescript AST 함수별 cyclomatic complexity
    score: qualityScore,
    grade: qualityGrade,
    cc,                   // {functions, avg, p90, max, over10, over20, worst[5]} — AST 모드만
    branchDensity,        // 100줄당 분기 수 (if/else/case/catch/삼항/&&/||)
    branches: totalBranches,
    functions: totalFunctions,
    avgFileLines,
    longFiles,            // 200줄 초과 파일 수
    maxFile,
  },
  kit: {
    features: usedFeatures.sort((a, b) => b.loc - a.loc),
    savedLines,
    savedKB: estimatedKB,
    savedA4: estimatedA4,
    savedPercent,
    usage,
  },
};

// 출력
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "kit-stats.json");
fs.writeFileSync(outPath, JSON.stringify(stats, null, 2));

console.log(`  파일: ${files.length}개`);
console.log(`  코드: ${codeLines.toLocaleString()}줄 (전체 ${totalLines.toLocaleString()}줄)`);
console.log(`    프론트: ${breakdown.frontend.files}개 파일, ${breakdown.frontend.codeLines.toLocaleString()}줄`);
console.log(`    백엔드: ${breakdown.backend.files}개 파일, ${breakdown.backend.codeLines.toLocaleString()}줄`);
console.log(`    공용: ${breakdown.shared.files}개 파일, ${breakdown.shared.codeLines.toLocaleString()}줄`);
console.log(`  kit 사용: ${usedFeatures.length}개 요소`);
console.log(`    컴포넌트: ${usage.component.used}/${usage.component.total}개 (${usage.component.percent}%)`);
console.log(`    훅: ${usage.hook.used}/${usage.hook.total}개 (${usage.hook.percent}%)`);
console.log(`    유틸리티: ${usage.util.used}/${usage.util.total}개 (${usage.util.percent}%)`);
console.log(`  절약량: 약 ${savedLines.toLocaleString()}줄, ${estimatedKB}KB (A4 ${estimatedA4}장)`);
console.log(`  비율: 전체의 약 ${savedPercent}%를 kit이 대신 처리`);
if (cc) {
  console.log(`  청결도: ${qualityGrade} (${qualityScore}점) — 함수 ${cc.functions}개, CC 평균 ${cc.avg}·최대 ${cc.max}, CC10+ ${cc.over10}개·CC20+ ${cc.over20}개, 200줄+ ${longFiles}개`);
  for (const w of cc.worst.filter((f) => f.cc > 10)) {
    console.log(`    복잡: ${w.name} CC ${w.cc} — ${w.file}:${w.line}`);
  }
} else {
  console.log(`  청결도: ${qualityGrade} (${qualityScore}점) — 분기밀도 ${branchDensity}/100줄, 평균 ${avgFileLines}줄/파일, 200줄+ ${longFiles}개 (regex 폴백 — typescript 설치 시 AST 정밀 분석)`);
}
console.log(`\n  저장됨 → ${path.relative(process.cwd(), outPath)}\n`);
