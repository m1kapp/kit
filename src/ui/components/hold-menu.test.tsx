import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HoldMenu, holdMenuPlacement } from "./hold-menu";

describe("HoldMenu", () => {
  it("puts the menu under the row, or above it near the bottom", () => {
    expect(holdMenuPlacement({ top: 100, bottom: 160 }, 800, 3)).toEqual({ top: 168 });
    // 3 items = 152px; under a row ending at 700 it would run past 800-16.
    expect(holdMenuPlacement({ top: 640, bottom: 700 }, 800, 3)).toEqual({ top: 640 - 8 - 152 });
    expect(holdMenuPlacement({ top: 60, bottom: 780 }, 800, 3)).toEqual({ top: 16 });
  });

  it("renders the row with a hover ··· named after it, and no menu until held", () => {
    const html = renderToStaticMarkup(
      <HoldMenu label="민호님의 댓글" items={[{ label: "삭제", danger: true, onSelect: () => {} }]}>
        <p>안녕</p>
      </HoldMenu>,
    );
    expect(html).toContain("<p>안녕</p>");
    expect(html).toContain('aria-label="민호님의 댓글 메뉴"');
    expect(html).toContain("pointer-coarse:hidden");
    expect(html).not.toContain('role="menu"');
  });
});
