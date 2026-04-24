#!/usr/bin/env node
// postinstall — @m1kapp/kit 설치 후 안내 메시지
// CI 환경이나 suppress 설정이면 조용히 종료

if (process.env.CI || process.env.npm_config_loglevel === "silent") {
  process.exit(0);
}

const v = process.env.npm_package_version ?? "";
const version = v ? ` v${v}` : "";

console.log(`
╭─────────────────────────────────────────────╮
│                                             │
│   @m1kapp/kit${version} 설치 완료!              │
│                                             │
│   Claude Code 스킬 추가 (선택):             │
│   npx m1kkit skills                         │
│                                             │
│   /m1kapp-init  프로젝트 초기 설정          │
│   /m1kapp-seo   SEO 자동 감사·적용          │
│   /m1kapp-pwa   PWA 설정 점검·적용          │
│                                             │
│   업데이트 후엔 스킬도 재설치 권장:         │
│   npx m1kkit skills                         │
│                                             │
╰─────────────────────────────────────────────╯
`);
