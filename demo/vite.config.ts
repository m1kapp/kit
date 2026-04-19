import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./node_modules/@m1kapp/kit/package.json");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
});
