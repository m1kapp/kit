// 앱 안 브라우저(인스타·카톡 …) 판별과 "바깥 브라우저로 열기" — 화면과 무관한 순수 로직(in-app.test.ts 가 검사)
// 소셜에서 들어오는 방문 대부분이 여기라, 설치 안내가 실제로 닿는 길은 바깥 브라우저로 넘기는 것이다.

export type InApp = "kakao" | "line" | "instagram" | "threads" | "facebook" | "naver" | "other";

export const IN_APP_NAME: Record<InApp, string> = {
  kakao: "카카오톡", line: "라인", instagram: "인스타그램", threads: "스레드",
  facebook: "페이스북", naver: "네이버 앱", other: "앱 안 브라우저",
};

// 스레드 UA 에는 Instagram 도 들어 있어 먼저 본다(Barcelona = 스레드 내부 이름)
export function detectInApp(ua: string): InApp | null {
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/ Line\//i.test(ua)) return "line";
  if (/Barcelona/i.test(ua)) return "threads";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/NAVER\(inapp/i.test(ua)) return "naver";
  if (/DaumApps|everytimeApp|; wv\)/i.test(ua)) return "other";
  return null;
}

export const isAndroid = (ua: string) => /Android/i.test(ua);

/**
 * 한 번에 바깥 브라우저로 여는 주소. 못 열면 null(손으로 메뉴를 눌러야 한다).
 * - 카카오톡: 공식 스킴 kakaotalk://web/openExternal — 기본 브라우저로 연다
 * - 라인: 주소에 openExternalBrowser=1
 * - 안드로이드의 나머지: intent:// 로 크롬을 직접 연다
 * - iOS 인스타·스레드 등: 막혀 있다
 */
export function externalUrl(app: InApp, url: string, android: boolean): string | null {
  if (app === "kakao") return `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  if (app === "line") return url + (url.includes("?") ? "&" : "?") + "openExternalBrowser=1";
  if (android) return `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
  return null;
}

/** 손으로 따라 할 단계 — [앞, 굵게, 뒤] */
export function inAppSteps(app: InApp, android: boolean): [string, string, string][] {
  const browser = android ? "Chrome" : "Safari";
  const menu: [string, string, string] =
    app === "kakao" ? (android ? ["오른쪽 위 ", "⋮", " 버튼을 누르세요"] : ["오른쪽 아래 ", "···", " 버튼을 누르세요"])
    : app === "instagram" || app === "threads" ? ["오른쪽 위 ", android ? "⋮" : "···", " 버튼을 누르세요"]
    : ["화면 위나 아래의 ", android ? "⋮ 또는 ···" : "···", " 메뉴를 누르세요"];
  const open: [string, string, string] =
    app === "kakao" ? ["", "다른 브라우저로 열기", "를 고르세요"]
    : app === "instagram" || app === "threads" ? ["", "외부 브라우저에서 열기", "를 고르세요"]
    : ["", `${browser}로 열기`, " 같은 항목을 고르세요"];
  return [menu, open, [`열린 ${browser}에서 `, "설치", " 버튼을 한 번 더 누르면 끝!"]];
}
