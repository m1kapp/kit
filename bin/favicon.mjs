#!/usr/bin/env node
/**
 * @m1kapp/kit favicon + SEO 이미지 생성 CLI
 *
 * Usage:
 *   npx @m1kapp/kit favicon
 *   npx @m1kapp/kit favicon --text=kit --color=#0f0f1a
 *   npx @m1kapp/kit favicon --text=W --color=#7c3aed --out=./static
 *   npx @m1kapp/kit favicon --appname="My App" --slogan="한 줄 소개" --domain=myapp.com
 *
 * Options:
 *   --text     파비콘에 표시할 짧은 텍스트 (기본: package.json name 첫 글자)
 *   --appname  OG 이미지/manifest용 앱 이름 (기본: package.json name)
 *   --slogan   OG 이미지 부제
 *   --domain   OG 이미지 하단 도메인 (선택)
 *   --color    브랜드색 hex (기본: #0f0f1a)
 *   --out      출력 디렉토리 (기본: 자동 감지)
 *
 * 생성 파일: favicon.ico · apple-touch-icon.png · icon-192.png · icon-512.png ·
 *           icon-maskable-512.png · og-image.png · manifest.json
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

function readPkgName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    return (pkg.name ?? "app").replace(/^@[^/]+\//, ""); // scoped 패키지 처리
  } catch {
    return "app";
  }
}

/* ─── Auto-detect short favicon text ─── */
function detectText() {
  if (args.text) return args.text;
  return readPkgName().slice(0, 3); // 최대 3글자
}

/* ─── Auto-detect full app name (OG/manifest용) ─── */
function detectAppName() {
  if (args.appname) return args.appname;
  return readPkgName();
}

/* ─── Load generators from dist ─── */
const distPath = path.resolve(__dirname, "../dist/ogimage.mjs");
const { createFaviconElement, OGImage } = await import(distPath);

/* ─── Generate ─── */
const text = detectText();
const appName = detectAppName();
const slogan = args.slogan;
const domain = args.domain;
const color = args.color ?? "#0f0f1a";
const outDir = detectOutDir();

async function generatePng(sizePx, maskable = false) {
  const res = new ImageResponse(
    h(createFaviconElement, { text, color, size: sizePx, maskable }),
    { width: sizePx, height: sizePx }
  );
  return Buffer.from(await res.arrayBuffer());
}

function write(name, buffer) {
  fs.writeFileSync(path.join(outDir, name), buffer);
  console.log(`✓ ${path.relative(process.cwd(), path.join(outDir, name))}`);
}

fs.mkdirSync(outDir, { recursive: true });

const icoBuffers = await Promise.all([16, 32, 48].map((s) => generatePng(s)));
write("favicon.ico", await pngToIco(icoBuffers));

write("apple-touch-icon.png", await generatePng(180));
write("icon-192.png", await generatePng(192));
write("icon-512.png", await generatePng(512));
write("icon-maskable-512.png", await generatePng(512, true));

const ogRes = new ImageResponse(
  h(OGImage, { type: "default", title: appName, sub: slogan, appName, color, domain }),
  { width: 1200, height: 630 }
);
write("og-image.png", Buffer.from(await ogRes.arrayBuffer()));

const manifest = {
  name: appName,
  short_name: appName,
  start_url: "/",
  display: "standalone",
  background_color: color,
  theme_color: color,
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};
write("manifest.json", JSON.stringify(manifest, null, 2) + "\n");

console.log(`\n🎉 appname="${appName}" color="${color}" → ${path.relative(process.cwd(), outDir) || "."}/`);
console.log(`
<head>에 붙여넣기:
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta property="og:image" content="https://<도메인>/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
`);
