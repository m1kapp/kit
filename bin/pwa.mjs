#!/usr/bin/env node
/**
 * m1kkit pwa — 오프라인 실행 + iOS 스플래시
 *
 * Usage:
 *   npx m1kkit pwa                       # public/manifest.json · public/icon-512.png 를 읽는다
 *   npx m1kkit pwa --bg=#ffffff          # 스플래시 배경색(기본: 흰색 — 앱 첫 화면과 같은 색이라야 번쩍임이 없다)
 *   npx m1kkit pwa --icon=public/logo.png --out=static
 *
 * 생성: sw.js · splash/<가로>x<세로>.png (아이폰 세로 화면별)
 * Vite 처럼 루트에 index.html 이 있으면 <head> 에 태그까지 넣는다. Next 는 출력된 태그를 layout 에 붙인다.
 * manifest.json 이 있으면 background_color 를 스플래시 배경과 맞춘다(안드로이드 스플래시가 그 색).
 */

import { ImageResponse } from "@vercel/og";
import { createElement as h } from "react";
import fs from "fs";
import path from "path";

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.join("=") || true];
  })
);

const cwd = process.cwd();
const outDir = path.resolve(cwd, args.out ?? "public");
const iconPath = path.resolve(cwd, args.icon ?? path.join(outDir, "icon-512.png"));
const bg = args.bg ?? "#ffffff";

if (!fs.existsSync(iconPath)) {
  console.error(`아이콘이 없어요: ${path.relative(cwd, iconPath)} — 먼저 npx m1kkit favicon 을 돌리거나 --icon 으로 지정하세요.`);
  process.exit(1);
}

function write(rel, data) {
  const file = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`✓ ${path.relative(cwd, file)}`);
}

/* ─── 서비스워커 ─── */
write("sw.js", `// m1kkit pwa 가 만든 파일 — 오프라인에서도 앱이 열리게 한다. 다시 만들려면 npx m1kkit pwa
// 페이지: 네트워크 먼저, 3초 안에 안 오거나 끊겨 있으면 저장본(여행지 로밍처럼 느린 망에서도 바로 뜬다).
//   그래서 새 배포는 온라인이면 다음 실행에 바로 보인다. 이 파일은 배포마다 바꿀 필요가 없다.
// JS·CSS·폰트·이미지: 저장본을 바로 주고 뒤에서 새로 받아 둔다. API(fetch) 요청은 건드리지 않는다.
// ponytail: 캐시 이름이 하나라 배포마다 옛 해시 파일이 조금씩 쌓인다 — 커지면 savePage 에서 안 쓰는 것 정리
const CACHE = "m1kkit-pwa";
const ASSET = ["script", "style", "font", "image", "manifest"];

// SPA 호스팅(Vercel rewrites 등)은 없는 파일에도 index.html 을 200 으로 준다.
// 그걸 JS 자리에 담으면 다음 오프라인 실행이 하얗게 뜬다 — 페이지가 아닌데 HTML 이면 안 담는다.
const keepable = (req, res) => res.type === "opaque" ||
  (res.ok && (req.mode === "navigate" || !(res.headers.get("content-type") ?? "").includes("text/html")));

// 페이지는 그 페이지가 부르는 JS·CSS 를 다 담은 뒤에 담는다 — 저장된 페이지가 없는 파일을 가리키는 순간이 없게.
// 하나라도 못 받으면 페이지는 옛 판을 그대로 둔다(옛 판의 파일은 남아 있다).
async function savePage(c, key, res) {
  const html = await res.clone().text();
  const own = [...html.matchAll(/(?:src|href)="(\\/[^"/][^"]*)"/g)].map((m) => new Request(m[1]));
  // CDN 폰트 CSS 도(Pretendard·Tossface 같은) — 빠지면 오프라인에서 글꼴·국기 이모지가 바뀐다. 실패해도 페이지는 담는다
  const cdn = [...html.matchAll(/href="(https:\\/\\/[^"]+\\.css)"/g)].map((m) => new Request(m[1], { mode: "no-cors" }));
  const got = (req) => c.match(req, { ignoreVary: true }).then(async (hit) => {
    if (hit) return true;
    const r = await fetch(req).catch(() => null); // add() 는 opaque 를 거절해서 직접 담는다
    return !!r && keepable(req, r) && c.put(req, r).then(() => true);
  });
  const ok = await Promise.all(own.map(got));
  await Promise.all(cdn.map(got));
  if (ok.every(Boolean)) await c.put(key, res);
}

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const res = await fetch("/", { cache: "no-store" });
    if (res.ok) await savePage(await caches.open(CACHE), "/", res);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || !r.url.startsWith("http")) return;
  if (r.mode === "navigate") {
    const net = fetch(r);
    // 복사는 응답이 화면으로 가기 전에, 같은 차례에서 — 늦으면 body already used
    e.waitUntil(net.then((res) => { if (!res.ok) return; const copy = res.clone(); return caches.open(CACHE).then((c) => savePage(c, r, copy)); }).catch(() => {}));
    return e.respondWith(page(r, net));
  }
  const same = new URL(r.url).origin === location.origin;
  if (same ? ASSET.includes(r.destination) : r.destination === "style" || r.destination === "font") e.respondWith(stale(r));
});

async function page(r, net) {
  const c = await caches.open(CACHE);
  const saved = () => c.match(r, { ignoreSearch: true, ignoreVary: true }).then((m) => m ?? c.match("/"));
  const slow = new Promise((ok) => setTimeout(ok, 3000)).then(async () => (await saved()) ?? net);
  try { return await Promise.race([net, slow]); } catch { return (await saved()) ?? Response.error(); }
}

async function stale(r) {
  const c = await caches.open(CACHE);
  const hit = await c.match(r, { ignoreVary: true }); // Vary: Origin 서버에서 저장본을 못 찾던 것
  const net = fetch(r).then((res) => { if (keepable(r, res)) c.put(r, res.clone()); return res; });
  if (!hit) return net;
  net.catch(() => {});
  return hit;
}
`);

/* ─── iOS 스플래시 ─── */
// iOS 는 manifest 를 안 보고 기기 해상도와 정확히 같은 그림만 쓴다. 안 맞으면 흰 화면.
// [CSS 폭, CSS 높이, 배율] — 세로 화면만(앱이 세로 고정). 아이패드는 뺐다.
const DEVICES = [
  [440, 956, 3], // 16 Pro Max · 17 Pro Max
  [402, 874, 3], // 16 Pro · 17 · 17 Pro
  [420, 912, 3], // Air
  [430, 932, 3], // 14 Pro Max · 15 Plus · 15 Pro Max · 16 Plus
  [393, 852, 3], // 14 Pro · 15 · 15 Pro · 16
  [428, 926, 3], // 12 Pro Max · 13 Pro Max · 14 Plus
  [390, 844, 3], // 12 · 13 · 14 · 16e
  [375, 812, 3], // X · XS · 11 Pro · 12 mini · 13 mini
  [414, 896, 3], // XS Max · 11 Pro Max
  [414, 896, 2], // XR · 11
  [414, 736, 3], // 6+ ~ 8 Plus
  [375, 667, 2], // 6 ~ 8 · SE 2·3
  [320, 568, 2], // SE 1
];

const icon = `data:image/png;base64,${fs.readFileSync(iconPath).toString("base64")}`;
const links = [];
for (const [w, h_, dpr] of DEVICES) {
  const W = w * dpr, H = h_ * dpr, size = Math.round(W * 0.28); // 아이콘은 화면 폭의 28% — 홈 화면 아이콘이 커지며 열리는 느낌
  const res = new ImageResponse(
    h("div", { style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: bg } },
      h("img", { src: icon, width: size, height: size, style: { borderRadius: size * 0.225 } })),
    { width: W, height: H }
  );
  write(`splash/${W}x${H}.png`, Buffer.from(await res.arrayBuffer()));
  links.push(`<link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h_}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" href="/splash/${W}x${H}.png" />`);
}

/* ─── manifest 배경색 ─── */
const manifestPath = path.join(outDir, "manifest.json");
let title;
if (fs.existsSync(manifestPath)) {
  const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  title = m.short_name ?? m.name;
  if (m.background_color !== bg) {
    m.background_color = bg;
    write("manifest.json", JSON.stringify(m, null, 2) + "\n");
  }
}

/* ─── <head> 태그 ─── */
// apple-mobile-web-app-capable 이 없으면 iOS 가 스플래시를 아예 안 쓴다.
// 서비스워커는 localhost 에선 안 건다 — 개발 중 HMR 이 저장본에 막히지 않게.
// 등록 스크립트는 켜 둔 앱이 돌아올 때 새 배포를 확인한다 — 내 JS 파일 이름이 새 HTML 에 없으면 새로고침.
const head = [
  `<!-- m1kkit:pwa -->`,
  `<meta name="apple-mobile-web-app-capable" content="yes" />`,
  `<meta name="mobile-web-app-capable" content="yes" />`,
  `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`,
  ...(title ? [`<meta name="apple-mobile-web-app-title" content="${title}" />`] : []),
  `<meta name="theme-color" content="${bg}" />`,
  ...links,
  `<script>
    if ("serviceWorker" in navigator && !/^(localhost|127\\.|\\[::1\\])/.test(location.hostname)) {
      navigator.serviceWorker.register("/sw.js");
      // 홈 화면 앱은 닫히지 않고 며칠씩 다시 켜지기만 한다 — 돌아올 때(30분에 한 번) 새 배포가 있으면 새로고침
      let mine = [], checked = Date.now();
      addEventListener("DOMContentLoaded", () => { mine = [...document.scripts].map((s) => s.getAttribute("src")).filter((s) => s && s[0] === "/"); });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden || Date.now() - checked < 18e5) return;
        checked = Date.now();
        fetch(location.pathname, { cache: "no-store" }).then((r) => (r.ok ? r.text() : ""))
          .then((html) => { if (html && mine.some((s) => !html.includes(s))) location.reload(); }, () => {});
      });
    }
    </script>`,
  `<!-- /m1kkit:pwa -->`,
].join("\n    ");

const indexPath = path.join(cwd, "index.html");
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, "utf8");
  const next = /<!-- m1kkit:pwa -->[\s\S]*?<!-- \/m1kkit:pwa -->/.test(html)
    ? html.replace(/<!-- m1kkit:pwa -->[\s\S]*?<!-- \/m1kkit:pwa -->/, head)
    : html.replace(/\s*<\/head>/, `\n    ${head}\n  </head>`);
  fs.writeFileSync(indexPath, next);
  console.log(`✓ index.html <head> 에 PWA 태그`);
} else {
  console.log(`\n<head> 에 붙여넣기:\n    ${head}\n`);
}

console.log(`\n🎉 오프라인 + 스플래시 ${DEVICES.length}종 (배경 ${bg}). 배포 후 홈 화면 앱을 비행기 모드로 열어 확인하세요.`);
