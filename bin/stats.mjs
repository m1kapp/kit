#!/usr/bin/env node
/**
 * m1kkit stats — 프로젝트의 코드량과 kit 사용 현황을 분석해서 .kit-stats.json 생성
 *
 * Usage:
 *   m1kkit stats                    # src/ 기준 분석
 *   m1kkit stats --dir=app          # 특정 디렉토리 기준
 *   m1kkit stats --out=public       # 출력 위치 지정
 *   m1kkit stats --llm              # (선택) Claude로 네이밍·응집도 자문 — 점수엔 미반영
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { execFileSync } from "child_process";

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

// AST 기반 함수별 복잡도 — cyclomatic(McCabe) + cognitive(SonarQube 근사)
// cognitive: 중첩 깊이 가중(+1+depth), 같은 논리 연산자 연쇄(a && b && c)는 1회만,
// ??는 카운트 제외(null 정규화는 복잡성이 아님). 중첩 함수는 별도 함수로 분리 집계
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

  // cognitive complexity (SonarQube 근사)
  // - 제어 구조: +1 + 현재 중첩 깊이, 내부는 깊이+1
  // - 논리 연산자: 같은 연산자 연쇄당 1회 (&&→|| 전환 시 +1), ?? 제외
  // - 삼항: +1+depth, else(if 아닌): +1
  const cognitiveOf = (fn) => {
    let score = 0;
    const LOGICAL = new Set([ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken]);
    const walk = (n, depth, parentLogicalOp) => {
      if (n !== fn && isFnLike(n)) return; // 중첩 함수는 자기 항목에서 계산
      switch (n.kind) {
        case ts.SyntaxKind.IfStatement: {
          score += 1 + depth;
          walk(n.expression, depth, null);
          walk(n.thenStatement, depth + 1, null);
          if (n.elseStatement) {
            if (n.elseStatement.kind === ts.SyntaxKind.IfStatement) {
              // else if — if 쪽에서 +1+depth 처리되므로 여기선 그대로 위임 (깊이 유지)
              walk(n.elseStatement, depth, null);
            } else {
              score += 1; // else 자체
              walk(n.elseStatement, depth + 1, null);
            }
          }
          return;
        }
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.CatchClause:
        case ts.SyntaxKind.ConditionalExpression: {
          score += 1 + depth;
          ts.forEachChild(n, (c) => walk(c, depth + 1, null));
          return;
        }
        case ts.SyntaxKind.SwitchStatement: {
          score += 1 + depth; // switch 전체 1회 (case별 아님)
          ts.forEachChild(n, (c) => walk(c, depth + 1, null));
          return;
        }
        case ts.SyntaxKind.BinaryExpression: {
          const op = n.operatorToken.kind;
          if (LOGICAL.has(op)) {
            if (op !== parentLogicalOp) score += 1; // 연쇄의 시작에서만
            walk(n.left, depth, op);
            walk(n.right, depth, op);
            return;
          }
          break;
        }
      }
      ts.forEachChild(n, (c) => walk(c, depth, null));
    };
    ts.forEachChild(fn, (c) => walk(c, 0, null));
    return score;
  };

  const fns = [];
  const collect = (n) => {
    if (isFnLike(n) && (n.body || ts.isArrowFunction(n))) {
      fns.push({
        name: fnName(n),
        cc: ccOf(n),
        cog: cognitiveOf(n),
        line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
      });
    }
    ts.forEachChild(n, collect);
  };
  collect(sf);
  return fns;
}

// 중복 코드 감지 — 토큰 정규화(식별자/리터럴 치환) + 슬라이딩 윈도우 해시 (jscpd 라이트)
// import 줄은 제외 (정규화하면 모든 import가 동일해져 가짜 중복 발생)
const DUP_WINDOW = 50; // 토큰 수 ≈ 코드 5~8줄

function tokenizeNormalized(ts, filePath, content) {
  // import/export-from 줄 제거
  const stripped = content
    .split("\n")
    .map((l) => (/^\s*(import\s|export\s+(\{|\*).*\sfrom\s)/.test(l) ? "" : l))
    .join("\n");
  const kind = /\.(tsx|jsx)$/.test(filePath) ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard;
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, /*skipTrivia*/ true, kind, stripped);
  const tokens = [];
  const lines = [];
  let tok = scanner.scan();
  while (tok !== ts.SyntaxKind.EndOfFileToken) {
    let norm;
    // 식별자만 정규화(이름 바꾼 복붙 검출), 리터럴은 원문 유지 —
    // 데이터 테이블(좌표·팔레트 행)이 전부 동일해지는 오탐 방지
    if (tok === ts.SyntaxKind.Identifier) norm = "I";
    else if (tok === ts.SyntaxKind.JsxText) { tok = scanner.scan(); continue; } // 마크업 텍스트 제외
    else if (tok === ts.SyntaxKind.StringLiteral || tok === ts.SyntaxKind.NoSubstitutionTemplateLiteral || tok === ts.SyntaxKind.NumericLiteral) norm = scanner.getTokenText();
    else norm = String(tok);
    tokens.push(norm);
    // 토큰 시작 위치의 줄 번호 (원본과 줄 구조 동일)
    const upto = stripped.slice(0, scanner.getTokenStart());
    lines.push(upto.split("\n").length);
    tok = scanner.scan();
  }
  return { tokens, lines };
}

function analyzeDuplication(ts, fileContents) {
  // 테스트 파일은 제외 — 반복 구조(케이스 나열)가 본질이라 중복 밀도를 왜곡
  const perFile = fileContents
    .filter(({ file }) => !/\.(test|spec)\.[tj]sx?$/.test(file))
    .map(({ file, content }) => ({
      file,
      ...tokenizeNormalized(ts, file, content),
    }));

  // 윈도우 해시 → 등장 위치 목록
  const seen = new Map(); // hash → [{fi, idx}]
  perFile.forEach((f, fi) => {
    for (let i = 0; i + DUP_WINDOW <= f.tokens.length; i++) {
      let h = 5381;
      for (let k = 0; k < DUP_WINDOW; k++) {
        const s = f.tokens[i + k];
        for (let c = 0; c < s.length; c++) h = ((h * 33) ^ s.charCodeAt(c)) >>> 0;
      }
      const arr = seen.get(h);
      if (arr) arr.push({ fi, idx: i });
      else seen.set(h, [{ fi, idx: i }]);
    }
  });

  // 2회 이상 등장한 윈도우가 덮는 토큰 마킹
  const dupMask = perFile.map((f) => new Uint8Array(f.tokens.length));
  const blockKeys = new Set(); // 대표 위치 수집용
  const examples = new Map(); // hash → [위치 문자열]
  for (const [h, locs] of seen) {
    if (locs.length < 2) continue;
    // 같은 파일 안 인접 중첩(자기 자신과 1토큰 시프트) 제외: 서로 다른 위치 그룹만
    const distinct = locs.filter((a, i) => locs.findIndex((b) => b.fi === a.fi && Math.abs(b.idx - a.idx) < DUP_WINDOW) === i);
    if (distinct.length < 2) continue;
    for (const { fi, idx } of distinct) {
      dupMask[fi].fill(1, idx, idx + DUP_WINDOW);
    }
    blockKeys.add(h);
    if (examples.size < 200 && !examples.has(h)) {
      examples.set(h, distinct.slice(0, 3).map(({ fi, idx }) => `${perFile[fi].file}:${perFile[fi].lines[idx]}`));
    }
  }

  let dupTokens = 0;
  let totalTokens = 0;
  const byFile = new Map();
  perFile.forEach((f, fi) => {
    totalTokens += f.tokens.length;
    let d = 0;
    for (let i = 0; i < dupMask[fi].length; i++) d += dupMask[fi][i];
    dupTokens += d;
    if (d > 0) byFile.set(f.file, d);
  });

  const percent = totalTokens > 0 ? Math.round((dupTokens / totalTokens) * 1000) / 10 : 0;
  const worstFiles = [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([file, d]) => ({ file, dupTokens: d }));
  // 대표 중복 블록 예시 (여러 위치에 나타나는 것 우선)
  const worstBlocks = [...examples.values()].sort((a, b) => b.length - a.length).slice(0, 3);

  return { percent, dupTokens, totalTokens, blocks: blockKeys.size, worstFiles, worstBlocks };
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
const allFns = []; // AST 모드: {name, cc, cog, line, file}
const fileContents = []; // 중복 감지용
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
    fileContents.push({ file: rel, content });
  }
  if (counts.code > maxFile.lines) maxFile = { path: path.relative(process.cwd(), file), lines: counts.code };
  if (counts.code > 200) longFiles++;
  const imports = detectKitImports(content);
  for (const imp of imports) allImports.add(imp);
}

const branchDensity = codeLines > 0 ? Math.round((totalBranches / codeLines) * 1000) / 10 : 0;
const avgFileLines = files.length > 0 ? Math.round(codeLines / files.length) : 0;

// 청결도 스코어 v2 (100점 만점)
// AST 모드: cognitive complexity(중첩 가중, SonarQube 함수당 15 권고) + 중복 밀도(SonarQube 3% 게이트)
// 프로젝트 크기 편향 없게 비율 기반 감점:
// - cog>15 함수 비율 ×3 (최대 25), cog>25 함수 비율 ×5 (최대 15)
// - 최악 함수: cog 20 초과분 ×1 (최대 15)
// - 중복 밀도: 3% 초과분 ×2.5 (최대 25) ← 새 축
// - 200줄 초과 파일 비율 ×2 (최대 10) / 평균 파일 길이 80줄 초과분 /5 (최대 10)
let qualityScore;
let cc = null;
let cognitive = null;
let duplication = null;
if (ts && allFns.length > 0) {
  const byCc = [...allFns].sort((a, b) => b.cc - a.cc);
  cc = {
    functions: allFns.length,
    avg: Math.round((allFns.reduce((s, f) => s + f.cc, 0) / allFns.length) * 10) / 10,
    p90: byCc[Math.floor((byCc.length - 1) * 0.1)].cc,
    max: byCc[0].cc,
    over10: byCc.filter((f) => f.cc > 10).length,
    over20: byCc.filter((f) => f.cc > 20).length,
    worst: byCc.slice(0, 5).map(({ name, cc, file, line }) => ({ name, cc, file, line })),
  };

  const byCog = [...allFns].sort((a, b) => b.cog - a.cog);
  const cogOver15 = byCog.filter((f) => f.cog > 15);
  const cogOver25 = byCog.filter((f) => f.cog > 25);
  const maxCog = byCog[0].cog;
  cognitive = {
    avg: Math.round((allFns.reduce((s, f) => s + f.cog, 0) / allFns.length) * 10) / 10,
    p90: byCog[Math.floor((byCog.length - 1) * 0.1)].cog,
    max: maxCog,
    over15: cogOver15.length,
    over25: cogOver25.length,
    worst: byCog.slice(0, 5).map(({ name, cog, cc, file, line }) => ({ name, cog, cc, file, line })),
  };

  duplication = analyzeDuplication(ts, fileContents);

  const over15Pct = (cogOver15.length / allFns.length) * 100;
  const over25Pct = (cogOver25.length / allFns.length) * 100;
  const longFilesPct = (longFiles / files.length) * 100;
  qualityScore = Math.max(0, Math.round(
    100
    - Math.min(25, over15Pct * 3)
    - Math.min(15, over25Pct * 5)
    - Math.min(15, Math.max(0, maxCog - 20))
    - Math.min(25, Math.max(0, duplication.percent - 3) * 2.5)
    - Math.min(10, longFilesPct * 2)
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
    engine: cc ? "ast2" : "regex", // ast2 = cognitive complexity + 중복 감지
    score: qualityScore,
    grade: qualityGrade,
    cognitive,            // {avg, p90, max, over15, over25, worst[5]} — 중첩 가중 복잡도
    duplication,          // {percent, blocks, worstFiles, worstBlocks} — 토큰 중복 밀도
    cc,                   // {functions, avg, p90, max, over10, over20, worst[5]} — McCabe (참고용)
    branchDensity,        // 100줄당 분기 수 (regex 근사, 참고용)
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
  console.log(`  청결도: ${qualityGrade} (${qualityScore}점) — 함수 ${cc.functions}개, cognitive 평균 ${cognitive.avg}·최대 ${cognitive.max}, cog15+ ${cognitive.over15}개·cog25+ ${cognitive.over25}개, 중복 ${duplication.percent}%, 200줄+ ${longFiles}개`);
  for (const w of cognitive.worst.filter((f) => f.cog > 15)) {
    console.log(`    복잡: ${w.name} cog ${w.cog} (CC ${w.cc}) — ${w.file}:${w.line}`);
  }
  if (duplication.percent > 3) {
    console.log(`  중복 상위 파일: ${duplication.worstFiles.map((f) => `${f.file}(${f.dupTokens}tok)`).join(", ")}`);
    for (const ex of duplication.worstBlocks) {
      console.log(`    중복 블록: ${ex.join(" ≒ ")}`);
    }
  }
} else {
  console.log(`  청결도: ${qualityGrade} (${qualityScore}점) — 분기밀도 ${branchDensity}/100줄, 평균 ${avgFileLines}줄/파일, 200줄+ ${longFiles}개 (regex 폴백 — typescript 설치 시 AST 정밀 분석)`);
}
// ── (선택) LLM 자문 — 정적 지표가 못 보는 네이밍·응집도. 점수엔 미반영, 자문만 ──
if (args.includes("--llm") && cognitive) {
  try {
    console.log(`  LLM 자문 요청 중... (claude haiku)`);
    // cognitive 최악 3개 함수 소스 발췌 (각 최대 60줄)
    const snippets = cognitive.worst.slice(0, 3).map((w) => {
      const abs = path.resolve(process.cwd(), w.file);
      const src = fs.readFileSync(abs, "utf-8").split("\n");
      const from = Math.max(0, w.line - 1);
      return `// ${w.file}:${w.line} — ${w.name} (cognitive ${w.cog})\n` + src.slice(from, from + 60).join("\n");
    }).join("\n\n---\n\n");

    const prompt = `다음은 한 프로젝트에서 cognitive complexity가 가장 높은 함수들이다. 정적 지표로 못 보는 관점만 평가하라: 네이밍 명확성, 함수 응집도(한 가지 일만 하는가), 본질적 복잡성인지 정리 가능한 복잡성인지. 반드시 아래 JSON 한 줄로만 답하라:
{"naming": 0-100, "cohesion": 0-100, "essential": true|false, "advice": "한국어 한 문장"}

${snippets}`;

    const out = execFileSync("claude", ["-p", prompt, "--model", "haiku"], {
      encoding: "utf-8",
      timeout: 90_000,
      maxBuffer: 1024 * 1024,
    });
    // 중첩 없는 JSON 오브젝트 후보들 중 파싱되는 첫 번째 사용
    const candidates = out.match(/\{[^{}]*\}/g) || [];
    let llm = null;
    for (const c of candidates) {
      try { llm = JSON.parse(c); break; } catch { /* 다음 후보 */ }
    }
    if (llm) {
      stats.quality.llm = { model: "haiku", ...llm };
      fs.writeFileSync(outPath, JSON.stringify(stats, null, 2));
      console.log(`  LLM 자문: 네이밍 ${llm.naming} · 응집도 ${llm.cohesion} · 본질적 복잡성 ${llm.essential ? "예" : "아니오"}`);
      console.log(`    → ${llm.advice}`);
    }
  } catch (e) {
    console.log(`  LLM 자문 실패 (claude CLI 필요): ${e.message?.slice(0, 60)}`);
  }
}

console.log(`\n  저장됨 → ${path.relative(process.cwd(), outPath)}\n`);
