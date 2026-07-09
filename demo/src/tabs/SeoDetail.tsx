import { Section, SectionHeader, Divider } from "@m1kapp/kit";
import { CodeCard } from "../shared";

/* ══════════════════════════════════════════════
   SEO Detail
══════════════════════════════════════════════ */
export function SeoDetail({ themeColor }: { themeColor: string }) {
  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          검색 노출에 필요한 보일러플레이트 — 메타데이터 · JSON-LD · sitemap · robots를 전부 <code className="font-mono text-zinc-700 dark:text-zinc-300">@m1kapp/kit/seo</code>에. 서버 전용, 의존성 0.
        </p>
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
          <span className="text-base leading-none" style={{ color: themeColor }}>🔍</span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Next.js App Router에 맞춰 두 가지 — <code className="font-mono">create*</code>는 문자열(Route Handler용), <code className="font-mono">next*</code>는 <code className="font-mono">MetadataRoute</code> 객체(파일 규칙용).
          </p>
        </div>
        <div className="mt-3">
          <CodeCard title="import" code={`import {\n  createMetadata, titleTemplate, jsonLd,\n  createSitemap, nextSitemap,\n  createRobots, nextRobots,\n} from "@m1kapp/kit/seo";`} />
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>메타데이터</SectionHeader>
        <CodeCard title="createMetadata · titleTemplate" code={`// app/layout.tsx\nexport const metadata = createMetadata({\n  title: "My App",\n  description: "앱 설명",\n  url: "https://myapp.com",\n  siteName: "My App",\n  image: "https://myapp.com/og.png",\n});\n// 자식 페이지 제목 템플릿: "Page | My App"\nexport const metadata = { title: titleTemplate("My App") };`} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>JSON-LD 구조화 데이터</SectionHeader>
        <CodeCard title="jsonLd — website · article · product · breadcrumb · organization · faq" code={`<script\n  type="application/ld+json"\n  dangerouslySetInnerHTML={{\n    __html: jsonLd.website({ name: "My App", url: "https://myapp.com" }),\n  }}\n/>\n// jsonLd.faq([{ question, answer }]) 등 6종`} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>sitemap · robots</SectionHeader>
        <div className="space-y-3">
          <CodeCard title="nextSitemap" code={`// app/sitemap.ts\nexport default function sitemap() {\n  return nextSitemap("https://myapp.com", [\n    { path: "/", priority: 1 },\n    { path: "/about", changeFrequency: "monthly" },\n  ]);\n}`} />
          <CodeCard title="nextRobots" code={`// app/robots.ts\nexport default function robots() {\n  return nextRobots({\n    sitemap: "https://myapp.com/sitemap.xml",\n    disallow: ["/admin"],\n  });\n}`} />
          <CodeCard title="createSitemap · createRobots (문자열)" code={`// Route Handler에서 직접 응답할 때\nreturn new Response(createSitemap([{ url: "https://myapp.com", priority: 1 }]), {\n  headers: { "Content-Type": "application/xml" },\n});`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}
