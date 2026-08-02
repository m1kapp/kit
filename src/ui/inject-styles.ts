import { COMPILED_CSS } from "./_compiled-styles";

let injected = false;

/**
 * Insert kit's compiled stylesheet into `<head>` exactly once, the moment
 * anything is imported from `@m1kapp/kit` (see the side-effect call below —
 * this runs at module load, before React ever renders anything, so the CSS
 * is guaranteed present by the time any kit component mounts).
 *
 * `AppShell` used to *also* render its own `<style href="m1kapp-kit"
 * precedence="default">`, meaning the ~60KB stylesheet was inserted twice —
 * once here, once via React 19's resource hoisting. Because `.dark\:*`
 * variants use a zero-specificity `:where()` wrapper (the standard Tailwind
 * v4 recipe) to tie their specificity to the plain utility, the duplicate
 * copy could put a *later* plain-mode rule after an *earlier* dark-mode rule
 * in the merged cascade layer — e.g. dark-mode text silently falling back to
 * the light-mode color. Confirmed via `CSS.getMatchedStylesForNode` against a
 * real double-injected page, and reproduced in dev/prod, with/without
 * StrictMode, and in kit's own already-shipped demo app. `AppShell` no longer
 * renders that `<style>` — this is the only injection path now.
 */
export function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const el = document.createElement("style");
  el.setAttribute("data-m1kapp-ui", "");
  el.textContent = COMPILED_CSS;
  document.head.appendChild(el);
}

// auto-inject on module load
injectStyles();
