import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@m1kapp/kit/ogimage", replacement: path.resolve(__dirname, "../src/og/index.ts") },
      { find: "@m1kapp/kit/pwa", replacement: path.resolve(__dirname, "../src/pwa/index.ts") },
      { find: "@m1kapp/kit/utils", replacement: path.resolve(__dirname, "../src/utils/index.ts") },
      { find: "@m1kapp/kit/server", replacement: path.resolve(__dirname, "../src/server/index.ts") },
      { find: "@m1kapp/kit/seo", replacement: path.resolve(__dirname, "../src/seo/index.ts") },
      { find: "@m1kapp/kit", replacement: path.resolve(__dirname, "../src/index.ts") },
    ],
  },
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
});
