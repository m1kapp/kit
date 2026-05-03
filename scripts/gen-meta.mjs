/**
 * gen-meta.mjs — kit 빌드 시 각 모듈의 실제 코드 줄 수를 측정해서 dist/meta.json 생성
 *
 * 빌드 파이프라인에서 tsup 전/후에 실행.
 * 소비자의 stats 스크립트가 이 파일을 읽어서 정확한 절약량을 계산한다.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));

// 측정 대상 매핑: export name → source file(s)
// 하나의 파일에 여러 export가 있을 수 있으므로, 파일 단위로 그룹핑 후 분배
const FILE_MAP = {
  // Components
  "ui/components/app-shell.tsx": ["AppShell", "AppShellHeader", "AppShellContent"],
  "ui/components/tab-bar.tsx": ["TabBar", "Tab"],
  "ui/components/button.tsx": ["Button"],
  "ui/components/fab.tsx": ["Fab"],
  "ui/components/grass-map.tsx": ["GrassMap"],
  "ui/components/stat-chip.tsx": ["StatChip"],
  "ui/components/avatar.tsx": ["Avatar"],
  "ui/components/badge.tsx": ["Badge"],
  "ui/components/skeleton.tsx": ["Skeleton"],
  "ui/components/empty-state.tsx": ["EmptyState"],
  "ui/components/dialog.tsx": ["Dialog"],
  "ui/components/in-app-sheet.tsx": ["InAppSheet"],
  "ui/components/tooltip.tsx": ["Tooltip"],
  "ui/components/typewriter.tsx": ["Typewriter"],
  "ui/components/theme-picker.tsx": ["ThemeButton", "ThemeDialog", "THEME_SCRIPT"],
  "ui/components/emoji-picker.tsx": ["EmojiButton", "EmojiPicker"],
  "ui/components/toast.tsx": ["ToastProvider", "useToast"],
  "ui/components/share.tsx": ["ShareButton", "useShare"],
  "ui/components/watermark.tsx": ["Watermark"],
  "ui/components/section.tsx": ["Section", "SectionHeader"],
  "ui/components/divider.tsx": ["Divider"],
  "ui/components/fonts.tsx": ["FontLinks", "fonts", "fontFamily"],
  "ui/components/colors.ts": ["colors"],
  "ui/components/powered-by.tsx": ["PoweredByKit"],
  // Hooks
  "ui/hooks/use-local-storage.ts": ["useLocalStorage"],
  "ui/hooks/use-debounce.ts": ["useDebounce"],
  "ui/hooks/use-form-submit.ts": ["useFormSubmit"],
  "ui/hooks/use-in-view.ts": ["useInView"],
  "ui/hooks/use-focus-trap.ts": ["useFocusTrap"],
  "ui/hooks/use-escape-key.ts": ["useEscapeKey"],
  "ui/hooks/use-scroll-lock.ts": ["useScrollLock"],
  "ui/hooks/use-portal-target.ts": ["usePortalTarget"],
};

// 추가 sub-path export 매핑
const SUBPATH_MAP = {
  "pwa/index.ts": ["mobileViewport", "createManifest", "svgIcon", "PWAInstallButton", "IOSInstallSheet", "usePWAInstall"],
  "utils/index.ts": ["cn", "relativeTime", "formatNumber", "formatPrice"],
};

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
  if (name[0] === name[0].toLowerCase()) return "util"; // cn, relativeTime, etc.
  if (["THEME_SCRIPT", "FontLinks", "fonts", "fontFamily", "colors"].includes(name)) return "util";
  return "component";
}

// 메인
const features = {};

// UI + hooks
// 같은 파일에서 나온 export들은 파일 LOC를 첫 번째 것에만 부여 (중복 카운트 방지)
// stats 스크립트가 "이 파일에서 하나라도 import했으면 파일 전체 LOC 절약" 로직 사용
for (const [relPath, exports] of Object.entries(FILE_MAP)) {
  const fullPath = path.join(SRC, relPath);
  const totalCodeLines = countCodeLines(fullPath);

  for (let i = 0; i < exports.length; i++) {
    const name = exports[i];
    features[name] = {
      loc: i === 0 ? totalCodeLines : 0, // 파일 대표만 LOC 보유
      category: categorize(name),
      source: relPath,
      isPrimary: i === 0,
    };
  }
}

// Sub-path exports — 같은 원리
for (const [relPath, exports] of Object.entries(SUBPATH_MAP)) {
  const fullPath = path.join(SRC, relPath);
  const totalCodeLines = countCodeLines(fullPath);
  const perExport = exports.length > 0 ? Math.round(totalCodeLines / exports.length) : 0;

  for (const name of exports) {
    features[name] = {
      loc: perExport,
      category: categorize(name),
      source: relPath,
      isPrimary: true,
    };
  }
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

const featureCount = Object.keys(features).length;
console.log(`  meta.json → ${featureCount}개 요소, 총 ${meta.totalCodeLines}줄 측정 완료`);
