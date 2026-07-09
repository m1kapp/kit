/* ═══════════════════════════════════════
   hex → rgba 유틸
═══════════════════════════════════════ */
export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** RGB to HSL 변환 */
export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = 60 * (((g - b) / d + (g < b ? 6 : 0)) % 6);
  else if (max === g) h = 60 * (((b - r) / d + 2) % 6);
  else h = 60 * (((r - g) / d + 4) % 6);
  return { h, s, l };
}

/** HSL to RGB 변환 */
export function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** 색상환에서 인접 색상 생성 (±45도) */
export function analogousColor(hex: string, hueShift = 45): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newH = (h + hueShift) % 360;
  const { r: nr, g: ng, b: nb } = hslToRgb(newH, s, l);
  return `rgb(${nr},${ng},${nb})`;
}

export function shiftColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return `rgb(${clamp(r + amount)},${clamp(g + amount)},${clamp(b + amount)})`;
}

/** 색상을 흰색과 mix해서 파스텔로 만듦 (mix: 0=원색, 1=흰색) */
export function pastelify(hex: string, mix = 0.5): string {
  const { r, g, b } = hexToRgb(hex);
  const p = (v: number) => Math.round(v + (255 - v) * mix);
  return `rgb(${p(r)},${p(g)},${p(b)})`;
}

/** RGB 채널 순환 — 단색에서 유사색 파생 */
export function rotatePastel(hex: string, mix = 0.38): string {
  const { r, g, b } = hexToRgb(hex);
  const p = (v: number) => Math.round(v + (255 - v) * mix);
  return `rgb(${p(b)},${p(r)},${p(g)})`; // b→r, r→g, g→b 순환
}


