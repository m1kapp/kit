import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const css = readFileSync(join(__dirname, "styles.css"), "utf8");

/** `.kit-stage` 블록만 잘라낸다. */
const stageBlock = css.match(/\.kit-stage\s*\{[^}]*\}/)?.[0] ?? "";

/**
 * `.kit-stage`의 `--kit-zoom: clamp(1, A + Bvw, cap)`을 그대로 계산한다.
 * `Bvw`는 CSS 단위상 `B * (뷰포트px / 100)`과 같다.
 */
function evalZoomAt(viewportPx: number): number {
  const m = stageBlock.match(
    /clamp\(\s*1\s*,\s*([\d.]+)\s*\+\s*([\d.]+)\s*\*\s*\(1vw \/ 1px\)\s*,\s*([\d.]+)\s*\)/,
  );
  if (!m) throw new Error("clamp() 표현식을 못 찾음 — .kit-stage CSS가 바뀌었나?");
  const [, a, b, cap] = m.map(Number);
  return Math.min(cap, Math.max(1, a + b * (viewportPx / 100)));
}

describe(".kit-stage — 데스크톱 셸 확대", () => {
  it("zoom과 height가 같은 변수를 쓴다", () => {
    expect(stageBlock).toContain("zoom: var(--kit-zoom)");
    expect(stageBlock).toContain("height: calc(100dvh / var(--kit-zoom))");
  });

  it("높이를 zoom으로 나눈다 — 안 나누면 모든 데스크톱 페이지에 스크롤바가 생긴다", () => {
    // zoom은 used value를 곱하므로, 여기서 그냥 100dvh를 쓰면 실제 렌더 높이가
    // zoom × 뷰포트가 되어 문서가 세로로 넘친다. 실측으로 확인한 지점이라 고정한다.
    expect(stageBlock).not.toMatch(/height:\s*100dvh\s*;/);
  });

  it("clamp()로 연속 스케일 — 미디어쿼리 점프 없음", () => {
    expect(stageBlock).toMatch(/clamp\(1, [\d.]+ \+ [\d.]+ \* \(1vw \/ 1px\), [\d.]+\)/);
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
  });

  it("좁은 화면(모바일/태블릿)에서는 1배로 바닥을 친다", () => {
    for (const vw of [320, 768, 1024]) {
      expect(evalZoomAt(vw)).toBeCloseTo(1, 1);
    }
  });

  it("측정으로 확인한 지점들과 맞는다 — 1920px에서 ~1.3배", () => {
    expect(evalZoomAt(1920)).toBeGreaterThan(1.2);
    expect(evalZoomAt(1920)).toBeLessThan(1.4);
  });

  it("초광폭/4K에서 상한이 걸린다 — 무한정 커지지 않음", () => {
    const at2560 = evalZoomAt(2560);
    const at3840 = evalZoomAt(3840);
    expect(at3840).toBe(at2560); // 상한 도달 후 평평
    expect(at2560).toBeGreaterThan(1.3); // 2560에서도 여전히 작다는 피드백 반영
    expect(at2560).toBeLessThanOrEqual(1.6); // 너무 커져서 셸이 아니게 되진 않게
  });

  it("리사이즈 중 값이 단조 증가한다 — 어디서도 튀지 않음", () => {
    const points = [320, 640, 1024, 1280, 1440, 1600, 1920, 2560, 3200];
    const values = points.map(evalZoomAt);
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
