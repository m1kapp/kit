/**
 * OG image generator for kit.m1k.app
 * Uses @vercel/og (Satori) to render a 1200x630 PNG.
 *
 * Usage: node scripts/generate-og.mjs
 */

import { ImageResponse } from "@vercel/og";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load Pretendard font
const fontBold = await readFile(
  join(
    __dirname,
    "../node_modules/@vercel/og/vendor/noto-sans-v27-latin-700.ttf",
  ),
).catch(() => null);

const CYAN = "#06b6d4";
const ZINC_950 = "#09090b";
const ZINC_800 = "#27272a";
const ZINC_400 = "#a1a1aa";

const response = new ImageResponse(
  {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: ZINC_950,
        padding: "80px",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Noto Sans", sans-serif',
      },
      children: [
        // Background grid pattern
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              opacity: 0.06,
              backgroundImage: `linear-gradient(${ZINC_400} 1px, transparent 1px), linear-gradient(90deg, ${ZINC_400} 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            },
          },
        },
        // Gradient glow - top right
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-120px",
              right: "-80px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${CYAN}30 0%, transparent 70%)`,
              display: "flex",
            },
          },
        },
        // Gradient glow - bottom left
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "-150px",
              left: "-100px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${CYAN}18 0%, transparent 70%)`,
              display: "flex",
            },
          },
        },
        // Package name badge
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 20px",
                    borderRadius: "100px",
                    border: `2px solid ${CYAN}50`,
                    backgroundColor: `${CYAN}15`,
                    color: CYAN,
                    fontSize: "24px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  },
                  children: "@m1kapp/kit",
                },
              },
            ],
          },
        },
        // Main heading
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "68px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
                    display: "flex",
                  },
                  children: "사이드 프로젝트를",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "68px",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
                    display: "flex",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: { color: CYAN },
                        children: "빠르게 완성",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: { color: "#ffffff" },
                        children: "하는 UI 킷",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Subtitle
        {
          type: "div",
          props: {
            style: {
              fontSize: "28px",
              color: ZINC_400,
              marginTop: "24px",
              display: "flex",
              letterSpacing: "-0.01em",
            },
            children: "UI Components  ·  SEO  ·  PWA  ·  OG Image",
          },
        },
        // Bottom bar
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "60px",
              left: "80px",
              right: "80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    color: ZINC_400,
                    display: "flex",
                    opacity: 0.7,
                  },
                  children: "kit.m1k.app",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#10b981",
                          display: "flex",
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "22px",
                          color: ZINC_400,
                          display: "flex",
                          opacity: 0.7,
                        },
                        children: "npm install @m1kapp/kit",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
  },
);

const buffer = Buffer.from(await response.arrayBuffer());
const outPath = join(__dirname, "../demo/public/og-image.png");
await writeFile(outPath, buffer);
console.log(`OG image written to ${outPath} (${buffer.length} bytes)`);
