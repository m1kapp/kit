/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** m1k.app 방문자 트래커 slug — `npx m1kkit track <url> --write` 가 .env 에 기록 */
  readonly VITE_M1K_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
