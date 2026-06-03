/**
 * gen-meta.mjs — kit 빌드 시 각 모듈의 실제 코드 줄 수를 측정해서 dist/meta.json 생성
 *
 * 빌드 파이프라인에서 tsup 전/후에 실행.
 * 소비자의 stats 스크립트가 이 파일을 읽어서 정확한 절약량을 계산한다.
 *
 * 자동 추출: 더 이상 export→파일 표를 손으로 관리하지 않는다. 각 엔트리
 * barrel(src/<entry>/index.ts)의 `export { … } from "./rel"` 구문을 파싱해
 * 실제 export되는 값(타입 제외)을 전부 수집한다 → 컴포넌트를 추가해도 자동 반영.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));

// 스캔할 엔트리 barrel들 = 소비자가 실제로 골라 쓰는 공개 UI 표면.
// (server/fetch/og는 백엔드·빌드 헬퍼라 "컴포넌트를 썼나" 집계 대상이 아님 → 제외)
// src/index.ts(루트 배럴)는 ui를 다시 재export하므로 제외 — leaf barrel만.
const ENTRY_BARRELS = [
  "ui/index.ts",
  "pwa/index.ts",
  "utils/index.ts",
  "seo/index.ts",
];

function countCodeLines(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let code = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/*") && !trimmed.startsWith("import ") && !trimmed.startsWith("export type")) {
      code++;
    }
  }
  return code;
}

function categorize(name) {
  if (name.startsWith("use")) return "hook";
  if (name[0] === name[0].toLowerCase()) return "util"; // cn, relativeTime, fonts, colors…
  if (["THEME_SCRIPT", "FontLinks"].includes(name)) return "util";
  return "component";
}

// "./components/chat" → 절대 소스 파일 경로(.tsx/.ts/…/index 해석)
function resolveSource(baseAbs) {
  for (const ext of [".tsx", ".ts", ".jsx", ".js"]) {
    if (fs.existsSync(baseAbs + ext)) return baseAbs + ext;
  }
  for (const idx of ["index.tsx", "index.ts"]) {
    const p = path.join(baseAbs, idx);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// barrel 한 개를 파싱 → [{ name, source(rel from SRC) }]
function parseBarrel(barrelRel) {
  const barrelAbs = path.join(SRC, barrelRel);
  if (!fs.existsSync(barrelAbs)) return [];
  const dir = path.dirname(barrelAbs);
  const content = fs.readFileSync(barrelAbs, "utf-8");
  const out = [];
  // (1) 재export: export { A, B as C } from "./rel";  ('export type { … }'는 제외)
  const reExport = /export\s+(type\s+)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = reExport.exec(content)) !== null) {
    if (m[1]) continue; // `export type { … }` 전체 스킵
    const rel = m[3];
    if (!rel.startsWith(".")) continue; // 외부 재export는 측정 대상 아님
    const resolved = resolveSource(path.resolve(dir, rel));
    if (!resolved) continue;
    const source = path.relative(SRC, resolved);
    for (const raw of m[2].split(",")) {
      const s = raw.trim();
      if (!s || s.startsWith("type ")) continue; // 인라인 `type X` 스킵
      const parts = s.split(/\s+as\s+/);
      const name = (parts[1] || parts[0]).trim(); // re-export는 별칭이 공개 이름
      if (name) out.push({ name, source });
    }
  }
  // (2) barrel 안에 직접 정의된 export (예: pwa의 KitStyles/svgIcon/mobileViewport).
  //     source는 barrel 파일 자신. `export type/interface/default/*`는 제외.
  const reDecl = /^\s*export\s+(?:async\s+)?(?:function|const|class|let|var)\s+([A-Za-z0-9_$]+)/gm;
  const selfSource = path.relative(SRC, barrelAbs);
  while ((m = reDecl.exec(content)) !== null) {
    out.push({ name: m[1], source: selfSource });
  }
  return out;
}

// 모든 barrel에서 export 수집 (이름 중복 시 첫 등장 유지)
const exportsByName = new Map(); // name → source(rel)
for (const barrel of ENTRY_BARRELS) {
  for (const { name, source } of parseBarrel(barrel)) {
    if (!exportsByName.has(name)) exportsByName.set(name, source);
  }
}

// 소스 파일 LOC는 한 번만 측정해 그 파일의 "대표 export"에만 부여(중복 카운트 방지).
// 소비자 stats는 같은 source를 한 번만 절약량에 더하므로 대표 1개에 몰아주면 됨.
const locCache = new Map(); // source(rel) → loc
function locOf(source) {
  if (!locCache.has(source)) locCache.set(source, countCodeLines(path.join(SRC, source)));
  return locCache.get(source);
}

const features = {};
const sourceHasPrimary = new Set();
for (const [name, source] of exportsByName) {
  const isPrimary = !sourceHasPrimary.has(source);
  if (isPrimary) sourceHasPrimary.add(source);
  features[name] = {
    loc: isPrimary ? locOf(source) : 0, // 파일 대표만 LOC 보유
    category: categorize(name),
    source,
    isPrimary,
  };
}

// PoweredByKit 자체는 절약량 0 (자기 자신이니까)
if (features["PoweredByKit"]) features["PoweredByKit"].loc = 0;

// dist/meta.json 출력
const meta = {
  version: pkg.version,
  generatedAt: new Date().toISOString(),
  totalCodeLines: Object.values(features).reduce((sum, f) => sum + f.loc, 0),
  features,
};

const distDir = path.join(ROOT, "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "meta.json"), JSON.stringify(meta, null, 2));

const byCat = { component: 0, hook: 0, util: 0 };
for (const f of Object.values(features)) byCat[f.category] = (byCat[f.category] || 0) + 1;
const featureCount = Object.keys(features).length;
console.log(`  meta.json → ${featureCount}개 요소 (컴포넌트 ${byCat.component}·훅 ${byCat.hook}·유틸 ${byCat.util}), 총 ${meta.totalCodeLines}줄 측정 완료`);
