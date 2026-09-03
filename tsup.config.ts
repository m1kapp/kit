import { defineConfig } from "tsup";
import pkg from "./package.json";

const common = {
  format: ["cjs", "esm"] as ("cjs" | "esm")[],
  dts: true,
  splitting: false,
  sourcemap: false,
  minify: true,
  define: {
    "__KIT_VERSION__": JSON.stringify(pkg.version),
  },
};

export default defineConfig([
  // Client bundle — "use client" banner, React external
  {
    ...common,
    entry: ["src/index.ts"],
    external: ["react", "react-dom", "@vercel/og"],
    banner: { js: '"use client";' },
  },
  // Server bundle — no "use client", no React
  {
    ...common,
    entry: { server: "src/server/index.ts" },
  },
  // OG image bundle — server-side only, never bundled into client
  {
    ...common,
    entry: { ogimage: "src/og/index.ts" },
    external: ["react", "react-dom", "@vercel/og", "next"],
  },
  // Next 전용 클라이언트 조각 — next/navigation 을 쓴다. 메인 배럴과 분리
  {
    ...common,
    entry: { next: "src/next/index.ts" },
    external: ["react", "react-dom", "next"],
    banner: { js: '"use client";' },
  },
  // PWA utils — server-safe (no "use client"), for manifest.ts / viewport exports
  {
    ...common,
    entry: { pwa: "src/pwa/index.ts" },
    external: ["react", "react-dom", "next"],
  },
  // Pure utils — server-safe (no "use client"), cn / formatNumber / relativeTime etc.
  {
    ...common,
    entry: { utils: "src/utils/index.ts" },
  },
  // SEO utils — server-safe, metadata / jsonLd / sitemap / robots
  {
    ...common,
    entry: { seo: "src/seo/index.ts" },
  },
]);
