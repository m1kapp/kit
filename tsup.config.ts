import { defineConfig } from "tsup";

const common = {
  format: ["cjs", "esm"] as ("cjs" | "esm")[],
  dts: true,
  splitting: false,
  sourcemap: false,
  minify: true,
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
  // PWA utils — server-safe (no "use client"), for manifest.ts / viewport exports
  {
    ...common,
    entry: { pwa: "src/pwa/index.ts" },
    external: ["next"],
  },
  // Pure utils — server-safe (no "use client"), cn / formatNumber / relativeTime etc.
  {
    ...common,
    entry: { utils: "src/utils/index.ts" },
  },
]);
