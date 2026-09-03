import { describe, expect, test } from "vitest";
import { formatDollarEok, formatNumber, formatPrice, formatWon, formatWonTight, particle, relativeTime, watermarkTint, withParticle } from "./index";

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

// ─── particle / withParticle ────────────────────────────────────────────────

describe("particle", () => {
  test("받침 있는 한글 → 은/이/을", () => {
    expect(withParticle("하이닉스", "은", "는")).toBe("하이닉스는");
    expect(withParticle("밥캣", "을", "를")).toBe("밥캣을");
    expect(withParticle("배달의민족", "이", "가")).toBe("배달의민족이");
  });

  test("ㄹ 받침 + 으로 → 로", () => {
    expect(withParticle("서울", "으로", "로")).toBe("서울로");
    expect(withParticle("조선", "으로", "로")).toBe("조선으로");
  });

  test("영문은 소리로 짐작", () => {
    expect(withParticle("Anysphere", "을", "를")).toBe("Anysphere를");
    expect(withParticle("Lucasfilm", "을", "를")).toBe("Lucasfilm을");
    expect(withParticle("Slack", "이", "가")).toBe("Slack이");
  });

  test("숫자 끝", () => {
    expect(withParticle("1", "이", "가")).toBe("1이");
    expect(withParticle("2", "이", "가")).toBe("2가");
  });
});

// ─── formatWon / formatDollarEok ────────────────────────────────────────────

describe("formatWon", () => {
  test("조 단위", () => {
    expect(formatWon(6_000_000_000_000)).toBe("6.0조 원");
    expect(formatWonTight(90_500_000_000_000)).toBe("90.5조");
  });

  test("천조 이상은 쉼표 정수", () => {
    expect(formatWonTight(1_236_700_000_000_000)).toBe("1,237조");
  });

  test("1조 미만은 억", () => {
    expect(formatWon(850_800_000_000)).toBe("8,508억 원");
  });
});

describe("formatDollarEok", () => {
  test("자릿수별", () => {
    expect(formatDollarEok(19_000_000_000)).toBe("$190억");
    expect(formatDollarEok(117_000_000_000)).toBe("$1,170억");
    expect(formatDollarEok(350_000_000)).toBe("$3.5억");
    expect(formatDollarEok(-4_900_000_000)).toBe("-$49억");
  });
});

// ─── watermarkTint ──────────────────────────────────────────────────────────

describe("watermarkTint", () => {
  test("쨍한 파랑 → 어두운 남색 슬레이트", () => {
    const tint = watermarkTint("#2563eb");
    expect(tint).toMatch(/^#[0-9a-f]{6}$/);
    const l = parseInt(tint.slice(1, 3), 16) + parseInt(tint.slice(3, 5), 16) + parseInt(tint.slice(5, 7), 16);
    expect(l).toBeLessThan(200); // 충분히 어둡다
  });

  test("무채색은 어두운 회색", () => {
    expect(watermarkTint("#ffffff")).toBe(watermarkTint("#000000"));
  });
});

// ─── KST 달력 ───────────────────────────────────────────────────────────────

import {
  isKstToday, kstMidnight, kstNowParts, kstToday, kstWeekLabel, kstWeekParam,
  kstWeekTitle, matchesQuery, startOfKstWeek, toChoseong, weeksAgoFromKstWeekParam,
} from "./index";

describe("kst", () => {
  // 2026-09-03(목) 12:00 KST = 03:00 UTC
  const now = Date.UTC(2026, 8, 3, 3, 0, 0);

  test("kstToday · kstNowParts", () => {
    expect(kstToday(now)).toBe("2026-09-03");
    expect(kstNowParts(now)).toEqual({ date: "2026-09-03", weekday: "목", hhmm: "12:00" });
  });

  test("UTC 자정 직전에도 한국 날짜가 맞다 — 서버가 UTC 라서 생기던 밀림", () => {
    // 2026-09-02 23:00 UTC = 2026-09-03 08:00 KST
    expect(kstToday(Date.UTC(2026, 8, 2, 23, 0, 0))).toBe("2026-09-03");
  });

  test("kstMidnight 은 그 한국 날짜의 00:00 epoch", () => {
    expect(kstMidnight(now)).toBe(Date.UTC(2026, 8, 2, 15, 0, 0)); // 9/3 00:00 KST
  });

  test("이번주 월요일 · 주차 라벨", () => {
    expect(startOfKstWeek(0, now)).toBe(Date.UTC(2026, 7, 30, 15, 0, 0)); // 8/31(월) 00:00 KST
    expect(kstWeekLabel(0, now)).toBe("8.31(월) ~ 9.6(일)");
  });

  test("ISO 주차 왕복", () => {
    const param = kstWeekParam(0, now);
    expect(param).toMatch(/^2026-\d{2}$/);
    expect(weeksAgoFromKstWeekParam(param, now)).toBe(0);
    expect(weeksAgoFromKstWeekParam(kstWeekParam(3, now), now)).toBe(3);
    expect(weeksAgoFromKstWeekParam("nope", now)).toBeNull();
    expect(kstWeekTitle(0, now)).toBe(`2026년 ${Number(param.slice(5))}주차`);
  });

  test("isKstToday", () => {
    expect(isKstToday(Date.UTC(2026, 8, 2, 23, 30, 0), now)).toBe(true); // 같은 한국 날짜
    expect(isKstToday(Date.UTC(2026, 8, 2, 12, 0, 0), now)).toBe(false); // 어제(한국)
  });
});

// ─── 초성 검색 ──────────────────────────────────────────────────────────────

describe("matchesQuery", () => {
  test("초성 질의", () => {
    expect(toChoseong("셀토스")).toBe("ㅅㅌㅅ");
    expect(matchesQuery("ㅅㅌㅅ", "셀토스")).toBe(true);
    expect(matchesQuery("ㅅㅌㅅ", "쏘렌토")).toBe(false);
  });

  test("일반 부분일치 · 대소문자·공백 무시", () => {
    expect(matchesQuery("ev", "EV6", "기아")).toBe(true);
    expect(matchesQuery("모델 y", "모델Y 주니퍼")).toBe(true);
    expect(matchesQuery("현대", "기아", undefined, "현대자동차")).toBe(true);
  });

  test("빈 질의는 전부 통과", () => {
    expect(matchesQuery("", "아무거나")).toBe(true);
  });
});
