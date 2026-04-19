/**
 * gen-favicon.mjs
 * Generates demo/public/favicon.ico + apple-touch-icon.png
 * using createFaviconElement from @m1kapp/kit/ogimage
 *
 * Usage: node scripts/gen-favicon.mjs
 */

import { ImageResponse } from "@vercel/og";
import { createElement as h } from "react";
import pngToIco from "png-to-ico";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../demo/public");

// Import createFaviconElement from built dist
const { createFaviconElement } = await import("../dist/ogimage.mjs");

async function generatePng(sizePx) {
  const res = new ImageResponse(
    h(createFaviconElement, {
      text: "kit",
      color: "#0f0f1a",
      size: sizePx,
    }),
    { width: sizePx, height: sizePx }
  );
  return Buffer.from(await res.arrayBuffer());
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// ICO (16, 32, 48)
const icoBuffers = await Promise.all([16, 32, 48].map(generatePng));
const icoBuffer = await pngToIco(icoBuffers);
fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), icoBuffer);
console.log("✓ favicon.ico (16, 32, 48)");

// Apple touch icon
const appleBuffer = await generatePng(180);
fs.writeFileSync(path.join(OUT_DIR, "apple-touch-icon.png"), appleBuffer);
console.log("✓ apple-touch-icon.png (180x180)");

// PWA icon
const pwaBuffer = await generatePng(512);
fs.writeFileSync(path.join(OUT_DIR, "icon-512.png"), pwaBuffer);
console.log("✓ icon-512.png (512x512)");

console.log("🎉 Favicons generated in demo/public/");
