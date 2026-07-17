import { useState } from "react";
import { Section, Dialog, CodeBlock } from "@m1kapp/kit";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "../logos";

const CLAUDE_PROMPT = `@m1kapp/kit으로 모바일 웹앱 만들어줘. CSS는 import만 하면 자동 주입돼.

[원칙] UI는 전부 kit으로. 버튼·입력·시트·토스트·차트·로딩·빈화면 등 kit에 있으면 직접 만들지 말고 무조건 그걸 써. 설치 후 node_modules/@m1kapp/kit의 export(타입 정의)를 한 번 훑어서 있는 컴포넌트를 최대한 적극 활용해.

[카탈로그 — 가능한 한 다 써]
· 셸/내비: AppShell · AppShellHeader/Content · TabBar · Fab · Section · Divider · Watermark
· 데이터: useFetch · usePolling · createApiClient / 로딩=Skeleton · 빈화면=EmptyState · BarList · ProgressRing · StatChip · GrassMap
· 입력/폼: Field · Switch · SegmentedControl · Select · ColorPicker · InlineEdit · Button · EmojiPicker
· 오버레이/피드백: Dialog · InAppSheet · ToastProvider/useToast · Tooltip
· 대화/AI: MessageList · ChatBubble · TypingIndicator · ActionCard
· 콘텐츠: ListRow · Collapsible · Stepper · Carousel · Badge · Avatar · CodeBlock · CopyButton · LinkifiedText · Countdown · Typewriter
· 테마: ThemeButton/ThemeDialog, 색은 --kit-accent (예: <AppShell accent="#e2603f">)
· 유틸: cn · relativeTime · formatNumber · formatPrice · formatDuration · groupByDay
· PWA/SEO/OG: createManifest · mobileViewport · createMetadata · OGImage
· API 라우트(서버, @m1kapp/kit/server): handler로 감싸고 ok/created/badRequest/unauthorized로 응답 · requireEnv로 env 검증 · 외부 호출은 fetchWithRetry/withRetry · LLM JSON은 recoverJsonFromText · OG는 scrapeOg · 날짜는 todayKST · slug는 idToSlug

[구조 — 필수] 최상위는 반드시 <Watermark color="..." text="...">로 감싸고 그 안에 <AppShell>을 넣어. AppShell만 단독으로 쓰면 화면이 뷰포트를 안 채우고 쪼그라들고, 하단 PoweredByKit 크레딧도 안 뜸. AppShellContent 안쪽은 <Section>(px-4) 블록을 <Divider spacing="sm" />로 구분해서 쌓아 — 직접 만든 padding div(예: <div className="p-4 flex flex-col gap-4">) 쓰지 말고.

[방문자 트래커 — 배포 후 기본으로 붙이기] 배포해서 URL이 생기면 항상 붙여: npx m1kkit track <배포 URL> 로 slug 발급받고, <Watermark trackSlug="발급된slug"> 로 직접 연결 (Vite면 NEXT_PUBLIC_M1K_SLUG env는 안 먹으니 꼭 prop으로). 계정 귀속(npx m1kkit claim)은 로그인이 필요해서 나중에 해도 되지만, 트래커 연결 자체는 미루지 말고 기본으로 항상 해.

먼저 npm i @m1kapp/kit 해줘.`;

// AI 코딩 에이전트 — 실제 브랜드 로고 (./logos)
const AGENT_LOGOS = [
  { mark: <ClaudeLogo />, label: "Claude Code" },
  { mark: <CursorLogo />, label: "Cursor" },
  { mark: <OpenAILogo />, label: "Codex" },
];

export function HomeQuickStart({ themeColor }: { themeColor: string }) {
  const [promptCopied, setPromptCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  return (
    <>
      {/* ── 빠른 시작 — 2가지 방법 ── */}
      <Section className="mt-2">
        <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900 dark:text-white">빠른 시작</h2>

        {/* 방법 1 — 그냥 복붙 (설치도 AI가) */}
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white" style={{ backgroundColor: themeColor }}>1</span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">그냥 복붙하기</span>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">설치까지 AI가</span>
        </div>
        <button
          onClick={() => setPromptOpen(true)}
          className="flex w-full flex-col items-center gap-2.5 rounded-2xl bg-zinc-50 p-5 text-center ring-1 ring-zinc-200 transition-colors hover:bg-zinc-100 active:scale-[0.99] dark:bg-zinc-900 dark:ring-white/10 dark:hover:bg-zinc-800"
        >
          <span className="flex -space-x-2">
            {AGENT_LOGOS.map(({ mark, label }) => (
              <span key={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-700 ring-2 ring-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-900">
                {mark}
              </span>
            ))}
          </span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">AI 에이전트에 프롬프트 복붙</span>
          <span className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">Claude Code · Cursor · Codex 어디든 · 탭해서 복사</span>
        </button>

        {/* 또는 */}
        <div className="my-3.5 flex items-center gap-2">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">또는</span>
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* 방법 2 — 설치 + 스킬 */}
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white" style={{ backgroundColor: themeColor }}>2</span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">설치하고 스킬 쓰기</span>
        </div>
        <CodeBlock code="npm install @m1kapp/kit" label="설치" className="mb-2.5" />

        <p className="mb-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">설치 후 Claude Code 프로젝트에 스킬 추가:</p>
        <CodeBlock code="npx m1kkit skills" label="스킬 추가" className="mb-2.5" />
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
          {[
            { cmd: "/m1kapp-init", desc: "프로젝트 초기 설정 스캐폴딩" },
            { cmd: "/m1kapp-seo",  desc: "SEO 감사 및 자동 적용" },
            { cmd: "/m1kapp-pwa",  desc: "PWA 설정 점검 및 적용" },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <span className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">{cmd}</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">{desc}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${themeColor}18`, color: themeColor }}>
                스킬
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Dialog open={promptOpen} onClose={() => setPromptOpen(false)} title="AI 에이전트에 복붙 → 앱 완성">
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          아래 프롬프트를 <span className="font-semibold text-zinc-700 dark:text-zinc-300">Claude Code · Cursor · Codex</span> 등 AI 코딩 에이전트 어디에 붙여넣어도 돼요.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {AGENT_LOGOS.map(({ mark, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {mark}{label}
            </span>
          ))}
        </div>
        <pre className="scrollbar-hide mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-zinc-950 px-4 py-3 font-mono text-[11px] leading-relaxed text-zinc-300 dark:bg-zinc-950">{CLAUDE_PROMPT}</pre>
        <button
          onClick={() => { navigator.clipboard.writeText(CLAUDE_PROMPT); setPromptCopied(true); setTimeout(() => setPromptCopied(false), 2000); }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          {promptCopied ? <>✓ 복사됨 — 에이전트에 ⌘V</> : <>이 프롬프트 복사하기</>}
        </button>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          붙여넣으면 <span className="font-semibold text-zinc-500 dark:text-zinc-300">이 데모 같은 모바일 앱</span>이 바로 나와요.
        </p>
      </Dialog>
    </>
  );
}
