import { describe, expect, test } from "vitest";
import { formatNumber, formatPrice, relativeTime } from "./index";

// ─── relativeTime ───────────────────────────────────────────────────────────

describe("relativeTime", () => {
  test("60초 미만 → 방금 전", () => {
    expect(relativeTime(Date.now() - 30_000)).toBe("방금 전");
  });

  test("1분 → 1분 전", () => {
    expect(relativeTime(Date.now() - 60_000)).toBe("1분 전");
  });

  test("30분 → 30분 전", () => {
    expect(relativeTime(Date.now() - 30 * 60_000)).toBe("30분 전");
  });

  test("1시간 → 1시간 전", () => {
    expect(relativeTime(Date.now() - 3_600_000)).toBe("1시간 전");
  });

  test("23시간 → 23시간 전", () => {
    expect(relativeTime(Date.now() - 23 * 3_600_000)).toBe("23시간 전");
  });

  test("하루 전 → 어제", () => {
    expect(relativeTime(Date.now() - 86_400_000)).toBe("어제");
  });

  test("3일 전 → 3일 전", () => {
    expect(relativeTime(Date.now() - 3 * 86_400_000)).toBe("3일 전");
  });

  test("2주 전 → 2주 전", () => {
    expect(relativeTime(Date.now() - 14 * 86_400_000)).toBe("2주 전");
  });

  test("30일 이상 → 날짜 포맷", () => {
    const result = relativeTime(new Date("2020-01-01"));
    expect(result).toMatch(/2020/);
  });

  test("string 입력도 동작", () => {
    expect(relativeTime(new Date().toISOString())).toBe("방금 전");
  });

  test("number 입력도 동작", () => {
    expect(relativeTime(Date.now() - 10_000)).toBe("방금 전");
  });
});

// ─── formatNumber ───────────────────────────────────────────────────────────

describe("formatNumber", () => {
  test("999 → 그대로", () => {
    expect(formatNumber(999)).toBe("999");
  });

  test("1000 → 1천", () => {
    expect(formatNumber(1_000)).toBe("1천");
  });

  test("1500 → 1.5천", () => {
    expect(formatNumber(1_500)).toBe("1.5천");
  });

  test("10000 → 1만", () => {
    expect(formatNumber(10_000)).toBe("1만");
  });

  test("15000 → 1.5만", () => {
    expect(formatNumber(15_000)).toBe("1.5만");
  });

  test("100000000 → 1억", () => {
    expect(formatNumber(100_000_000)).toBe("1억");
  });

  test("음수 처리", () => {
    expect(formatNumber(-1_500)).toBe("-1.5천");
  });

  test("0 → 0", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

// ─── formatPrice ────────────────────────────────────────────────────────────

describe("formatPrice", () => {
  test("9900 → ₩9,900", () => {
    expect(formatPrice(9_900)).toBe("₩9,900");
  });

  test("0 → ₩0", () => {
    expect(formatPrice(0)).toBe("₩0");
  });

  test("USD → $ 포함", () => {
    const result = formatPrice(9.99, "USD", "en-US");
    expect(result).toContain("9.99");
    expect(result).toContain("$");
  });

  test("KRW 소수점 없음", () => {
    expect(formatPrice(1_000)).not.toContain(".");
  });
});
