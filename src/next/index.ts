/*
 * Next.js 전용 조각. next/navigation 을 런타임에 임포트하므로 메인 배럴에
 * 섞지 않는다 — 0.0.45 에서 메인 번들에 섞였다가 next 내부가 통째로 딸려
 * 들어가 Vite 앱이 "Dynamic require of react" 로 죽었다.
 *
 *   import { ScrollRestorer } from "@m1kapp/kit/next";
 */
export { ScrollRestorer, markTabNavigation } from "./scroll-restorer";
