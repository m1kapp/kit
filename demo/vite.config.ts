import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@m1kapp/kit": path.resolve(import.meta.dirname, "../src"),
    },
  },
});
