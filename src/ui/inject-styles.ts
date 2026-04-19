import { COMPILED_CSS } from "./_compiled-styles";

let injected = false;

export function injectStyles() {
  if (injected || typeof document === "undefined") return;
  if (document.querySelector("[data-m1kapp-ui]")) { injected = true; return; }
  injected = true;
  const el = document.createElement("style");
  el.setAttribute("data-m1kapp-ui", "");
  el.textContent = COMPILED_CSS;
  document.head.appendChild(el);
}

// auto-inject on module load
injectStyles();
