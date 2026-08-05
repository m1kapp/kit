import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const css = readFileSync(join(__dirname, "styles.css"), "utf8");

/** `.kit-stage` 블록만 잘라낸다. */
const stageBlock = css.match(/\.kit-stage\s*\{[^}]*\}/)?.[0] ?? "";

/** `.kit-stage`의 width/height clamp와 min()을 그대로 계산한다. */
function evalZoomAt(viewportWidth: number, viewportHeight: number): number {
  const widthMatch = stageBlock.match(
    /--kit-zoom-width:\s*clamp\(\s*1\s*,\s*([\d.]+)\s*\+\s*([\d.]+)\s*\*\s*\(1vw \/ 1px\)\s*,\s*([\d.]+)\s*\)/,
  );
  const heightMatch = stageBlock.match(
    /--kit-zoom-height:\s*clamp\(\s*1\s*,\s*\(1dvh \/ 1px\)\s*\/\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/,
  );
  if (!widthMatch || !heightMatch) {
    throw new Error("width/height clamp 표현식을 못 찾음 — .kit-stage CSS가 바뀌었나?");
  }
  const [, a, b, widthCap] = widthMatch.map(Number);
  const [, heightDivisor, heightCap] = heightMatch.map(Number);
  const widthZoom = Math.min(widthCap, Math.max(1, a + b * (viewportWidth / 100)));
  const heightZoom = Math.min(heightCap, Math.max(1, (viewportHeight / 100) / heightDivisor));
  return Math.min(widthZoom, heightZoom);
}

describe(".kit-stage — 데스크톱 셸 확대", () => {
  it("zoom과 height가 같은 변수를 쓴다", () => {
    expect(stageBlock).toContain("--kit-zoom: min(var(--kit-zoom-width), var(--kit-zoom-height))");
    expect(stageBlock).toContain("zoom: var(--kit-zoom)");
    expect(stageBlock).toContain("height: calc(100dvh / var(--kit-zoom))");
  });

  it("높이를 zoom으로 나눈다 — 안 나누면 모든 데스크톱 페이지에 스크롤바가 생긴다", () => {
    // zoom은 used value를 곱하므로, 여기서 그냥 100dvh를 쓰면 실제 렌더 높이가
    // zoom × 뷰포트가 되어 문서가 세로로 넘친다. 실측으로 확인한 지점이라 고정한다.
    expect(stageBlock).not.toMatch(/height:\s*100dvh\s*;/);
  });

  it("clamp()로 연속 스케일 — 미디어쿼리 점프 없음", () => {
    expect(stageBlock).toMatch(/--kit-zoom-width:\s*clamp\(1, [\d.]+ \+ [\d.]+ \* \(1vw \/ 1px\), [\d.]+\)/);
    expect(stageBlock).toMatch(/--kit-zoom-height:\s*clamp\(1, \(1dvh \/ 1px\) \/ [\d.]+, [\d.]+\)/);
    // 미디어쿼리로 되돌아가지 않았는지 — 두 단짜리 브레이크포인트는 리사이즈 중 눈에 띄는 pop이 생긴다.
    expect(css).not.toMatch(/@media[^{]*\{\s*\.kit-stage/);
  });

  it("number + length를 직접 더하지 않는다 — computed-value-time에 무효화돼 zoom이 조용히 1로 폴백한다", () => {
    // <number> + <length>(vw)를 직접 더하는 형태는 zoom 프로퍼티 대입 시 통째로
    // invalid 처리되고, var() 는 초기값(1)으로 조용히 떨어진다 — 콘솔 에러도 없어서
    // 실측(getComputedStyle)으로만 드러난다. 반드시 length÷length로 먼저 숫자로
    // 벗겨낸 뒤(`1vw / 1px`) 곱셈·덧셈해야 한다. 코드 주석 속 반면교사 예시 문구는
    // 그대로 걸리므로 실제 선언부만 보게 주석을 지우고 검사한다.
    const declOnly = stageBlock.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(declOnly).not.toMatch(/\d\s*\+\s*[\d.]+vw(?!\s*\/)/);
    expect(declOnly).toContain("(1vw / 1px)");
    expect(declOnly).toContain("(1dvh / 1px)");
  });

  it("좁은 화면(모바일/태블릿)에서는 1배로 바닥을 친다", () => {
    for (const [vw, vh] of [[320, 568], [768, 1024], [1024, 768]]) {
      expect(evalZoomAt(vw, vh)).toBeCloseTo(1, 1);
    }
  });

  it("1366×768·1600×900 같은 짧은 데스크톱에서 너비만 보고 확대하지 않는다", () => {
    expect(evalZoomAt(1366, 768)).toBe(1);
    expect(evalZoomAt(1600, 900)).toBe(1);
  });

  it("1920×1080에서는 세로 공간이 배율을 제한한다", () => {
    const zoom = evalZoomAt(1920, 1080);
    expect(zoom).toBeGreaterThan(1);
    expect(zoom).toBeLessThan(1.1);
  });

  it("초광폭/4K에서 상한이 걸린다 — 무한정 커지지 않음", () => {
    const at2560 = evalZoomAt(2560, 1440);
    const at3840 = evalZoomAt(3840, 2160);
    expect(at3840).toBe(1.5);
    expect(at2560).toBeGreaterThan(1.3); // 2560에서도 여전히 작다는 피드백 반영
    expect(at2560).toBeLessThanOrEqual(1.6); // 너무 커져서 셸이 아니게 되진 않게
  });

  it("가로·세로가 함께 커질 때 값이 단조 증가한다 — 어디서도 튀지 않음", () => {
    const points = [[320, 568], [640, 800], [1024, 768], [1280, 800], [1440, 900], [1600, 1000], [1920, 1080], [2560, 1440], [3200, 1800]];
    const values = points.map(([width, height]) => evalZoomAt(width, height));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it("zoom prop으로 끄거나 고정할 수 있게 --kit-zoom 하나로 오버라이드 지점을 남긴다", () => {
    expect(css).toContain("--kit-zoom:");
    expect(css).not.toContain("--kit-zoom-md");
    expect(css).not.toContain("--kit-zoom-lg");
  });
});
