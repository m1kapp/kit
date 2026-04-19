import { defineConfig } from "tsup";

const common = {
  format: ["cjs", "esm"] as const,
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
]);
