import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
// @ts-expect-error — plain .mjs helper, no types
import { detectProject, findWatermarkFile, upsertEnv, wireSlug } from "./project.mjs";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "m1k-project-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const write = (rel: string, body: string) => {
  const full = join(dir, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, body);
  return full;
};

describe("detectProject", () => {
  it("vite.config.ts → vite", () => {
    write("vite.config.ts", "export default {}");
    expect(detectProject(dir)).toMatchObject({ kind: "vite", envVar: "VITE_M1K_SLUG" });
  });

  it("next dependency → next", () => {
    write("package.json", JSON.stringify({ dependencies: { next: "^16" } }));
    expect(detectProject(dir)).toMatchObject({ kind: "next", envVar: "NEXT_PUBLIC_M1K_SLUG" });
  });

  it("both present → next wins", () => {
    write("vite.config.ts", "export default {}");
    write("package.json", JSON.stringify({ dependencies: { next: "^16" } }));
    expect(detectProject(dir).kind).toBe("next");
  });

  it("nothing recognizable → unknown, no env var to suggest", () => {
    expect(detectProject(dir)).toMatchObject({ kind: "unknown", envVar: null });
  });

  it("survives a malformed package.json", () => {
    write("package.json", "{ not json");
    write("vite.config.ts", "export default {}");
    expect(detectProject(dir).kind).toBe("vite");
  });
});

describe("findWatermarkFile", () => {
  it("finds the file using <Watermark>, skipping node_modules", () => {
    write("node_modules/pkg/Decoy.tsx", "<Watermark />");
    const real = write("src/App.tsx", "export default () => <Watermark>x</Watermark>;");
    expect(findWatermarkFile(dir)).toBe(real);
  });

  it("returns null when nothing uses it", () => {
    write("src/App.tsx", "export default () => <div />;");
    expect(findWatermarkFile(dir)).toBeNull();
  });
});

describe("upsertEnv", () => {
  it("creates, then updates in place rather than duplicating the key", () => {
    expect(upsertEnv(dir, "VITE_M1K_SLUG", "aa").action).toBe("created");
    expect(upsertEnv(dir, "VITE_M1K_SLUG", "bb").action).toBe("updated");
    const env = readFileSync(join(dir, ".env"), "utf8");
    expect(env.match(/VITE_M1K_SLUG/g)).toHaveLength(1);
    expect(env).toContain("VITE_M1K_SLUG=bb");
  });

  it("appends alongside unrelated keys and keeps them", () => {
    write(".env", "OTHER=1\n");
    upsertEnv(dir, "VITE_M1K_SLUG", "aa");
    const env = readFileSync(join(dir, ".env"), "utf8");
    expect(env).toContain("OTHER=1");
    expect(env).toContain("VITE_M1K_SLUG=aa");
  });
});

describe("wireSlug", () => {
  it("injects trackSlug and writes .env for a vite project", () => {
    write("vite.config.ts", "export default {}");
    write("src/App.tsx", `export default () => (\n  <Watermark color="#fff" text="x">y</Watermark>\n);\n`);

    const r = wireSlug(dir, "gx");

    expect(r.patched).toBe("src/App.tsx");
    expect(r.alreadyWired).toBe(false);
    expect(readFileSync(join(dir, "src/App.tsx"), "utf8")).toContain(
      `<Watermark trackSlug="gx" color="#fff"`,
    );
    expect(readFileSync(join(dir, ".env"), "utf8")).toContain("VITE_M1K_SLUG=gx");
  });

  it("leaves an existing trackSlug alone — including the template's env expression", () => {
    write("vite.config.ts", "export default {}");
    const src = `<Watermark trackSlug={import.meta.env.VITE_M1K_SLUG} text="x">y</Watermark>`;
    write("src/App.tsx", src);

    const r = wireSlug(dir, "gx");

    expect(r.alreadyWired).toBe(true);
    expect(readFileSync(join(dir, "src/App.tsx"), "utf8")).toBe(src);
    expect(readFileSync(join(dir, ".env"), "utf8")).toContain("VITE_M1K_SLUG=gx");
  });

  it("still records the env var when no Watermark file exists", () => {
    write("vite.config.ts", "export default {}");
    const r = wireSlug(dir, "gx");
    expect(r.patched).toBeNull();
    expect(r.env).toMatchObject({ key: "VITE_M1K_SLUG" });
  });
});
