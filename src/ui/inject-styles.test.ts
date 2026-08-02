import { describe, it, expect, afterEach, vi } from "vitest";
import { injectStyles } from "./inject-styles";

/**
 * This module auto-injects kit's compiled stylesheet on import (see the
 * side-effect call at the bottom of inject-styles.ts) — it's the *only*
 * injection path now. `AppShell` used to *also* render its own
 * `<style href="m1kapp-kit" precedence="default">`, so the ~60KB stylesheet
 * landed in `<head>` twice; because Tailwind's `.dark\:*` variants use a
 * zero-specificity `:where()` wrapper, the duplicate could silently flip
 * which rule won the cascade (dark-mode text falling back to the light-mode
 * color). These tests pin single-injection directly against the real
 * mechanism, without needing jsdom (Node has no `document`, so the
 * auto-invoke-on-import above is a guaranteed no-op in this test file —
 * exactly the SSR case the `typeof document === "undefined"` guard exists
 * for — leaving `injected` false for the tests below to drive explicitly).
 */
describe("injectStyles — single-injection guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing without a document (SSR) — no throw", () => {
    expect(() => injectStyles()).not.toThrow();
  });

  it("inserts the stylesheet exactly once, even across repeated calls", () => {
    const appended: Array<{ attrs: Record<string, string>; textContent: string }> = [];
    vi.stubGlobal("document", {
      createElement: () => {
        const el = {
          attrs: {} as Record<string, string>,
          textContent: "",
          setAttribute(k: string, v: string) {
            this.attrs[k] = v;
          },
        };
        return el;
      },
      head: {
        appendChild: (el: (typeof appended)[number]) => appended.push(el),
      },
    });

    injectStyles();
    injectStyles();
    injectStyles();

    expect(appended).toHaveLength(1);
    expect(appended[0].attrs["data-m1kapp-ui"]).toBe("");
    expect(appended[0].textContent.length).toBeGreaterThan(1000); // real compiled CSS, not a stub
  });
});
