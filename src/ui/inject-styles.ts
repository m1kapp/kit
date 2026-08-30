import { COMPILED_CSS } from "./_compiled-styles";

let injected = false;

/**
 * Insert kit's compiled stylesheet into `<head>` exactly once for client-only
 * apps. SSR apps can render `<KitStyles />` before the first paint; when that
 * server style is already present, the client injector leaves it in place.
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
 * renders that `<style>`; SSR apps use `<KitStyles />`, while client-only apps
 * use this injector.
 */
export function injectStyles() {
  if (injected || typeof document === "undefined") return;
  if (document.querySelector('[data-m1kapp-ui], style[data-href="m1kapp-kit"]')) return;
  injected = true;
  const el = document.createElement("style");
  el.setAttribute("data-m1kapp-ui", "");
  el.textContent = COMPILED_CSS;
  document.head.appendChild(el);
}

// auto-inject on module load
injectStyles();
