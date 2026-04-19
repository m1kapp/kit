#!/usr/bin/env node
/**
 * @m1kapp/kit favicon generator CLI
 *
 * Usage:
 *   npx @m1kapp/kit favicon
 *   npx @m1kapp/kit favicon --text=kit --color=#0f0f1a
 *   npx @m1kapp/kit favicon --text=W --color=#7c3aed --out=./static
 *
 * Options:
 *   --text     표시할 텍스트 (기본: package.json name 첫 글자)
 *   --color    배경색 hex (기본: #0f0f1a)
 *   --out      출력 디렉토리 (기본: 자동 감지)
 */

import { ImageResponse } from "@vercel/og";
import { createElement as h } from "react";
import pngToIco from "png-to-ico";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ─── CLI args ─── */
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [key, ...rest] = a.slice(2).split("=");
      return [key, rest.join("=") || true];
    })
);

/* ─── Auto-detect output directory ─── */
function detectOutDir() {
  const cwd = process.cwd();

  // 명시적으로 지정한 경우
  if (args.out) return path.resolve(cwd, args.out);

  // Next.js App Router → public/
  if (fs.existsSync(path.join(cwd, "next.config.ts")) ||
      fs.existsSync(path.join(cwd, "next.config.js")) ||
      fs.existsSync(path.join(cwd, "next.config.mjs"))) {
    return path.join(cwd, "public");
  }

  // Vite / 일반 SPA → public/
  if (fs.existsSync(path.join(cwd, "vite.config.ts")) ||
      fs.existsSync(path.join(cwd, "vite.config.js"))) {
    return path.join(cwd, "public");
  }

  // public/ 폴더가 있으면 그냥 거기
  if (fs.existsSync(path.join(cwd, "public"))) {
    return path.join(cwd, "public");
  }

  // 없으면 현재 디렉토리
  return cwd;
}

/* ─── Auto-detect text ─── */
function detectText() {
  if (args.text) return args.text;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    const name = (pkg.name ?? "app").replace(/^@[^/]+\//, ""); // scoped 패키지 처리
    return name.slice(0, 3); // 최대 3글자
  } catch {
    return "app";
  }
}

/* ─── Load createFaviconElement from dist ─── */
const distPath = path.resolve(__dirname, "../dist/ogimage.mjs");
const { createFaviconElement } = await import(distPath);

/* ─── Generate ─── */
const text = detectText();
const color = args.color ?? "#0f0f1a";
const outDir = detectOutDir();

async function generatePng(sizePx) {
  const res = new ImageResponse(
    h(createFaviconElement, { text, color, size: sizePx }),
    { width: sizePx, height: sizePx }
  );
  return Buffer.from(await res.arrayBuffer());
}

fs.mkdirSync(outDir, { recursive: true });

const icoBuffers = await Promise.all([16, 32, 48].map(generatePng));
const icoBuffer = await pngToIco(icoBuffers);
fs.writeFileSync(path.join(outDir, "favicon.ico"), icoBuffer);
console.log(`✓ ${path.relative(process.cwd(), path.join(outDir, "favicon.ico"))}`);

const appleBuffer = await generatePng(180);
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), appleBuffer);
console.log(`✓ ${path.relative(process.cwd(), path.join(outDir, "apple-touch-icon.png"))}`);

const pwaBuffer = await generatePng(512);
fs.writeFileSync(path.join(outDir, "icon-512.png"), pwaBuffer);
console.log(`✓ ${path.relative(process.cwd(), path.join(outDir, "icon-512.png"))}`);

console.log(`\n🎉 text="${text}" color="${color}" → ${path.relative(process.cwd(), outDir) || "."}/`);
