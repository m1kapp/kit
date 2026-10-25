import { describe, expect, it } from "vitest";
import { detectInApp, externalUrl, inAppSteps } from "./in-app";

const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

describe("detectInApp", () => {
  it("앱 안 브라우저를 구분한다", () => {
    expect(detectInApp(`${IOS} KAKAOTALK 10.8.5`)).toBe("kakao");
    expect(detectInApp(`${IOS} Instagram 350.0.0.0 (iPhone15,2; iOS 18_0; ko_KR)`)).toBe("instagram");
    expect(detectInApp(`${IOS} Barcelona 360.0 Instagram 350.0`)).toBe("threads"); // 스레드 UA 엔 Instagram 도 있다
    expect(detectInApp(`${IOS} Safari Line/14.0.0`)).toBe("line");
    expect(detectInApp(`${IOS} [FBAN/FBIOS;FBAV/450.0]`)).toBe("facebook");
  });
  it("진짜 사파리·크롬은 null", () => {
    expect(detectInApp(`${IOS} Version/18.0 Safari/604.1`)).toBeNull();
    expect(detectInApp("Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile Safari/537.36")).toBeNull();
  });
});

describe("externalUrl", () => {
  const url = "https://calc.m1k.app/vnd";
  it("카카오톡은 공식 스킴, 라인은 파라미터", () => {
    expect(externalUrl("kakao", url, false)).toBe("kakaotalk://web/openExternal?url=https%3A%2F%2Fcalc.m1k.app%2Fvnd");
    expect(externalUrl("line", url, false)).toBe("https://calc.m1k.app/vnd?openExternalBrowser=1");
    expect(externalUrl("line", url + "?a=1", false)).toBe("https://calc.m1k.app/vnd?a=1&openExternalBrowser=1");
  });
  it("안드로이드는 크롬 intent, iOS 인스타는 못 연다", () => {
    expect(externalUrl("instagram", url, true)).toBe("intent://calc.m1k.app/vnd#Intent;scheme=https;package=com.android.chrome;end");
    expect(externalUrl("instagram", url, false)).toBeNull();
  });
});

it("단계는 마지막에 다시 설치를 누르라고 끝난다", () => {
  expect(inAppSteps("kakao", false)[1][1]).toBe("다른 브라우저로 열기");
  expect(inAppSteps("instagram", true).at(-1)?.[0]).toBe("열린 Chrome에서 ");
});
