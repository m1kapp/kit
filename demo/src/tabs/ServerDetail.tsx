import { Section, SectionHeader, Divider } from "@m1kapp/kit";
import { CodeCard } from "../shared";

/* ══════════════════════════════════════════════
   Server Detail
══════════════════════════════════════════════ */
export function ServerDetail({ themeColor }: { themeColor: string }) {
  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          API 라우트에서 자주 손으로 만들던 것들 — 전부 <code className="font-mono text-zinc-700 dark:text-zinc-300">@m1kapp/kit/server</code>에. 서버 전용, 의존성 0.
        </p>
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
          <span className="text-base leading-none" style={{ color: themeColor }}>🔌</span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            클라이언트 번들에 안 섞여요 — <code className="font-mono">@m1kapp/kit/server</code>는 별도 서버 엔트리라 React 없이 Node/Next 런타임에서만 돕니다.
          </p>
        </div>
        <div className="mt-3">
          <CodeCard title="import" code={`import {\n  handler, ok, created, badRequest, unauthorized, notFound, safely,\n  requireEnv, fetchWithRetry, withRetry, recoverJsonFromText,\n  scrapeOg, todayKST, dateInTz, idToSlug, slugToId, appHost,\n} from "@m1kapp/kit/server";`} />
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>라우트 핸들러 + 응답</SectionHeader>
        <CodeCard title="handler() · ok / badRequest / unauthorized" code={`export const GET = handler(async (req) => {\n  const user = await auth(req);\n  if (!user) unauthorized();             // throw → 401 JSON\n  const q = new URL(req.url).searchParams.get("q");\n  if (!q) badRequest("q is required");   // throw → 400 JSON\n  return ok(await search(q));            // 200 JSON\n});\n// try/catch 불필요 — handler가 에러를 잡아 JSON 응답으로`} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>env 검증</SectionHeader>
        <CodeCard title="requireEnv" code={`const { XAI_API_KEY, DATABASE_URL } = requireEnv([\n  "XAI_API_KEY", "DATABASE_URL",\n]);\n// 없으면 500 throw, 있으면 타입된 객체`} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>외부 호출 · 재시도</SectionHeader>
        <div className="space-y-3">
          <CodeCard title="fetchWithRetry" code={`// 타임아웃 + 429/5xx 자동 재시도 (마지막 응답 반환)\nconst res = await fetchWithRetry(url, {\n  headers: { authorization: "Bearer " + key },\n  retries: 3, timeoutMs: 8000,\n});`} />
          <CodeCard title="withRetry" code={`// 아무 async나 재시도 (Neon 콜드스타트 등)\nconst rows = await withRetry(() => db.query.users.findMany(), {\n  shouldRetry: (e) => String(e).includes("fetch failed"),\n});`} />
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>LLM · OG · 날짜 · slug</SectionHeader>
        <div className="space-y-3">
          <CodeCard title="recoverJsonFromText" code={`// 코드펜스/트레일링콤마/노이즈 제거하고 파싱\nconst data = recoverJsonFromText<{ items: string[] }>(llmReply);`} />
          <CodeCard title="scrapeOg" code={`const og = await scrapeOg("example.com");\n// { title, description, image, siteName, url }`} />
          <CodeCard title="todayKST · dateInTz" code={`todayKST();                         // "2026-06-04"\ndateInTz(Date.now(), "America/New_York");`} />
          <CodeCard title="idToSlug · appHost" code={`const slug = idToSlug(42, 1000);    // slugToId(slug, 1000)로 역변환\nconst base = "https://" + appHost("m1k.app");`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}
