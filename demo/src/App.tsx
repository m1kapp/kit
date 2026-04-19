import { useState, useEffect } from "react";

declare const __PKG_VERSION__: string;

import {
  Watermark, AppShell, AppShellHeader, AppShellContent,
  TabBar, Tab, Section, SectionHeader, Divider,
  StatChip, EmptyState, Button, colors,
  ThemeButton, ThemeDialog, EmojiButton, EmojiPicker,
  Tooltip, Typewriter, GrassMap,
  Avatar, Badge, ShareButton, useShare,
  ToastProvider, useToast,
  useLocalStorage, useDebounce, useFormSubmit, useInView,
  Skeleton, Dialog,
  mobileViewport, svgIcon, createManifest,
  PWAInstallButton, IOSInstallSheet, usePWAInstall,
  useFetch, usePolling,
  relativeTime, formatNumber, formatPrice, cn,
} from "@m1kapp/kit";
import { OGImage } from "@m1kapp/kit/ogimage";
import type { OGProps } from "@m1kapp/kit/ogimage";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
type View = "list" | "ui" | "og" | "pwa" | "fetch" | "utils";

/* ══════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════ */
function makeGrassData() {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    data.push({ date: key, count: Math.random() > 0.55 ? Math.floor(Math.random() * 80) + 1 : 0 });
  }
  return data;
}
const GRASS_DATA = makeGrassData();
const ALL_COLORS = Object.entries(colors).map(([name, color]) => ({ name, color }));

/* ══════════════════════════════════════════════
   Shared UI pieces
══════════════════════════════════════════════ */
function ComponentCard({ name, desc, code, children }: {
  name: string; desc: string; code: string; children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-mono">{"<"}{name}{" />"}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
      </div>
      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800">{children}</div>
      <button
        onClick={() => setShowCode(!showCode)}
        className="w-full px-3 py-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
      >
        {showCode ? "코드 숨기기" : "코드 보기"}
      </button>
      {showCode && (
        <pre className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 overflow-x-auto leading-relaxed bg-zinc-100 dark:bg-zinc-950">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function CodeCard({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-mono">{title}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="px-3 py-3 text-[11px] text-zinc-600 dark:text-zinc-400 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ══════════════════════════════════════════════
   Library List (Home)
══════════════════════════════════════════════ */
const LIBRARIES = [
  {
    id: "ui" as const,
    icon: "🧩",
    name: "UI",
    package: "@m1kapp/kit",
    desc: "모바일 앱 셸 컴포넌트 모음. AppShell, TabBar, Avatar 등 24개.",
    stats: [{ label: "컴포넌트", value: 24 }],
    requires: "react, react-dom",
    tags: ["AppShell", "TabBar", "Avatar", "Badge", "ShareButton", "Toast"],
  },
  {
    id: "og" as const,
    icon: "🖼",
    name: "OG Image",
    package: "@m1kapp/kit",
    desc: "Next.js OG 이미지 생성기. 7가지 템플릿 × 3가지 배경.",
    stats: [{ label: "템플릿", value: 7 }, { label: "배경 스타일", value: 3 }],
    requires: "next/og (Next.js 내장)",
    tags: ["OGImage", "loadPretendard", "loadGoogleFont", "createEmojiLoader"],
  },
  {
    id: "pwa" as const,
    icon: "📱",
    name: "PWA",
    package: "@m1kapp/kit",
    desc: "manifest 생성기, viewport, 앱 설치 유도 버튼까지 한 번에.",
    stats: [{ label: "유틸", value: 3 }, { label: "컴포넌트", value: 2 }],
    requires: "next (Viewport 타입)",
    tags: ["createManifest", "svgIcon", "mobileViewport", "PWAInstallButton"],
  },
  {
    id: "fetch" as const,
    icon: "🌐",
    name: "Fetch",
    package: "@m1kapp/kit",
    desc: "캐싱·중복제거·재시도·포커스 revalidate가 포함된 fetch 유틸.",
    stats: [{ label: "훅", value: 2 }, { label: "유틸", value: 2 }],
    requires: null,
    tags: ["useFetch", "usePolling", "createApiClient", "ApiError"],
  },
  {
    id: "utils" as const,
    icon: "🛠",
    name: "Utils",
    package: "@m1kapp/kit",
    desc: "날짜·숫자 포맷, 클래스 유틸, 범용 훅 모음. 어디서나 그냥 쓰면 됩니다.",
    stats: [{ label: "순수 유틸", value: 4 }, { label: "훅", value: 3 }],
    requires: null,
    tags: ["relativeTime", "formatNumber", "useDebounce", "useFormSubmit", "useInView"],
  },
];

function LibraryList({ themeColor, onSelect }: { themeColor: string; onSelect: (v: "ui" | "og" | "pwa" | "fetch" | "utils") => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <Section className="pt-5">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">@m1kapp/kit</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            v{__PKG_VERSION__}
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          사이드 프로젝트를 위한 UI · OG · PWA 유틸리티 모음.
          <br />
          하나만 설치하면 다 됩니다.
        </p>
      </Section>

      <Section className="mt-4">
        <div className="flex gap-2">
          <a
            href="https://github.com/m1kapp/kit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-center text-sm font-semibold text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors ring-1 ring-white/10"
          >
            GitHub
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText("npm install @m1kapp/kit"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ring-1 ring-zinc-200 dark:ring-white/10"
          >
            {copied ? "Copied!" : "npm i @m1kapp/kit"}
          </button>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>라이브러리</SectionHeader>
        <div className="space-y-2">
          {LIBRARIES.map((lib) => (
            <button
              key={lib.id}
              onClick={() => onSelect(lib.id)}
              className="w-full text-left p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{lib.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{lib.name}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{lib.desc}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {lib.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors flex-shrink-0 mt-1">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-3">
                  {lib.stats.map((s) => (
                    <div key={s.label}>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{s.value}</span>
                      <span className="text-xs text-zinc-400 ml-1">{s.label}</span>
                    </div>
                  ))}
                </div>
                {lib.requires && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    필요 {lib.requires}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   UI Detail
══════════════════════════════════════════════ */
function EmojiPickerDemo() {
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState("🏠");
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Tap →</span>
        <EmojiButton emoji={emoji} onClick={() => setOpen(true)} />
      </div>
      <EmojiPicker open={open} onClose={() => setOpen(false)} current={emoji} onSelect={setEmoji} />
    </>
  );
}

function ToastDemo({ themeColor }: { themeColor: string }) {
  const toast = useToast();
  return (
    <ComponentCard
      name="useToast + ToastProvider"
      desc="가벼운 토스트 알림 — 성공·오류·정보"
      code={`// root에 ToastProvider 감싸기\n<ToastProvider><App /></ToastProvider>\n\n// 어디서나\nconst toast = useToast();\ntoast("저장됐어요!", { variant: "success" });\ntoast("오류 발생", { variant: "error" });\ntoast("링크 복사됨");`}
    >
      <div className="flex flex-wrap gap-2">
        {([
          { label: "기본", variant: "default" as const, msg: "알림이에요." },
          { label: "성공", variant: "success" as const, msg: "저장됐어요!" },
          { label: "오류", variant: "error" as const, msg: "오류가 발생했어요." },
          { label: "정보", variant: "info" as const, msg: "업데이트가 있어요." },
        ]).map(({ label, variant, msg }) => (
          <button
            key={variant}
            onClick={() => toast(msg, { variant })}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
          >
            {label}
          </button>
        ))}
      </div>
    </ComponentCard>
  );
}

function LocalStorageDemo() {
  const [count, setCount, removeCount] = useLocalStorage<number>("demo-count", 0);
  const [name, setName] = useLocalStorage<string>("demo-name", "");
  return (
    <ComponentCard
      name="useLocalStorage"
      desc="새로고침 후에도 유지되는 로컬 상태"
      code={`const [count, setCount, remove] = useLocalStorage("key", 0);\nsetCount(c => c + 1);\nremove(); // localStorage 삭제`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setCount((c) => c - 1)} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">−</button>
          <span className="flex-1 text-center text-lg font-bold text-zinc-800 dark:text-zinc-200">{count}</span>
          <button onClick={() => setCount((c) => c + 1)} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+</button>
          <button onClick={removeCount} className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2">초기화</button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새로고침해도 남아요..."
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
          style={{ fontSize: "16px" }}
        />
        <p className="text-[10px] text-zinc-400 font-mono">localStorage["demo-count"] = {count}, ["demo-name"] = "{name}"</p>
      </div>
    </ComponentCard>
  );
}

function SkeletonDemo() {
  const [show, setShow] = useState(true);
  return (
    <ComponentCard
      name="Skeleton"
      desc="애니메이션 로딩 플레이스홀더"
      code={`<Skeleton className="h-4 w-3/4" />\n<Skeleton className="h-10 w-full" rounded="xl" />\n<Skeleton className="h-10 w-10" rounded="full" />`}
    >
      <div className="space-y-3">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setShow(v => !v)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            {show ? "스켈레톤 보기" : "콘텐츠 보기"}
          </button>
        </div>
        {show ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" rounded="full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" rounded="xl" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar fallback="MH" size="md" color="#3f3f46" />
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">minho</p>
                <p className="text-xs text-zinc-400">m1k.app</p>
              </div>
            </div>
            <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">이미지</div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">실제 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

function DialogDemo({ themeColor }: { themeColor: string }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <ComponentCard
      name="Dialog"
      desc="모달 다이얼로그 — backdrop · esc · scroll lock"
      code={`<Dialog open={open} onClose={() => setOpen(false)} title="설정">\n  <p className="text-sm text-zinc-500">내용</p>\n</Dialog>`}
    >
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          다이얼로그 열기
        </button>
        <button onClick={() => setConfirmOpen(true)} className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
          확인 다이얼로그
        </button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="다이얼로그 예시">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          backdrop 클릭 또는 ESC 키로 닫혀요. 스크롤도 자동으로 잠깁니다.
        </p>
        <div className="mt-4">
          <Button onClick={() => setOpen(false)}>확인</Button>
        </div>
      </Dialog>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="정말 삭제할까요?">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">이 작업은 되돌릴 수 없어요.</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">삭제</button>
          <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">취소</button>
        </div>
      </Dialog>
    </ComponentCard>
  );
}

function DebounceDemo({ themeColor }: { themeColor: string }) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 400);
  const [searchCount, setSearchCount] = useState(0);
  useEffect(() => {
    if (debounced) setSearchCount(c => c + 1);
  }, [debounced]);
  return (
    <ComponentCard
      name="useDebounce"
      desc="타이핑 멈출 때만 반응 — 검색창 필수"
      code={`const debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  if (debouncedQuery) search(debouncedQuery);\n}, [debouncedQuery]);`}
    >
      <div className="space-y-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="타이핑해보세요..."
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
          style={{ fontSize: "16px" }}
        />
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">실시간: <span className="text-zinc-600 dark:text-zinc-300">{input || "—"}</span></span>
          <span className="text-zinc-400">400ms 후: <span style={{ color: themeColor }}>{debounced || "—"}</span></span>
        </div>
        <p className="text-[10px] text-zinc-400">API 호출 횟수: {searchCount}회 (타이핑마다 X → 멈출 때만 O)</p>
      </div>
    </ComponentCard>
  );
}

function FormSubmitDemo({ themeColor }: { themeColor: string }) {
  const [url, setUrl] = useState("");
  const { submit, loading, error, data, reset } = useFormSubmit(
    async (value: string) => {
      await new Promise(r => setTimeout(r, 1200));
      if (!value.startsWith("http")) throw new Error("URL은 http로 시작해야 해요");
      return { id: Math.random().toString(36).slice(2), url: value };
    }
  );
  return (
    <ComponentCard
      name="useFormSubmit"
      desc="loading / error / data — try/catch 없이"
      code={`const { submit, loading, error } = useFormSubmit(\n  async (url: string) => api.post("/api/sites", { url })\n);\n\n<form onSubmit={e => { e.preventDefault(); submit(input); }}>\n  <Button loading={loading}>등록</Button>\n  {error && <p>{error.message}</p>}\n</form>`}
    >
      <div className="space-y-2">
        {data ? (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">등록 완료!</p>
              <p className="text-[10px] text-green-600 dark:text-green-500 font-mono mt-0.5">{data.url}</p>
            </div>
            <button onClick={reset} className="text-[10px] text-green-600 dark:text-green-400 hover:underline">초기화</button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); submit(url); }} className="space-y-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
              style={{ fontSize: "16px" }}
            />
            {error && <p className="text-xs text-red-500">{error.message}</p>}
            <button
              type="submit"
              disabled={loading || !url}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              {loading ? "등록 중…" : "등록"}
            </button>
          </form>
        )}
      </div>
    </ComponentCard>
  );
}

function UtilsDemo() {
  const now = new Date();
  const samples = [
    { label: "30초 전", date: new Date(now.getTime() - 30_000) },
    { label: "25분 전", date: new Date(now.getTime() - 25 * 60_000) },
    { label: "3시간 전", date: new Date(now.getTime() - 3 * 3600_000) },
    { label: "어제", date: new Date(now.getTime() - 30 * 3600_000) },
    { label: "5일 전", date: new Date(now.getTime() - 5 * 86400_000) },
  ];
  return (
    <ComponentCard
      name="relativeTime · formatNumber · formatPrice · cn"
      desc="순수 유틸 — 어디서나 import"
      code={`relativeTime(date)      // "3분 전"\nformatNumber(15_000)   // "1.5만"\nformatNumber(1_500_000)// "150만"\nformatPrice(9900)      // "₩9,900"\ncn("base", isOn && "active", err && "error")`}
    >
      <div className="space-y-2">
        <div className="rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {samples.map(s => (
            <div key={s.label} className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{s.label}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{relativeTime(s.date)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1500, 15_000, 150_000, 1_500_000].map(n => (
            <div key={n} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{n.toLocaleString()}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{formatNumber(n)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[[9900, "KRW"], [9.99, "USD"]].map(([n, c]) => (
            <div key={String(c)} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{c}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{formatPrice(Number(n), String(c))}</span>
            </div>
          ))}
        </div>
      </div>
    </ComponentCard>
  );
}

function UIDetail({ themeColor, dark, onThemeSelect }: {
  themeColor: string; dark: boolean; onThemeSelect: (c: string) => void;
}) {
  const [demoTab, setDemoTab] = useState("home");
  const navItems = [
    { key: "home", label: "Home", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { key: "search", label: "Search", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
    { key: "profile", label: "Profile", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  ];

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          CSS는 import 시 자동 주입됩니다. 별도 스타일시트 import 불필요.
        </p>
        <div className="mt-3">
          <CodeCard title="import" code={`import { AppShell, TabBar, Button, ... } from "@m1kapp/kit";`} />
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>레이아웃</SectionHeader>
        <div className="space-y-3">
          <ComponentCard name="AppShell" desc="Mobile container — centers at 430px with shadow" code={`<AppShell>\n  <AppShellHeader>...</AppShellHeader>\n  <AppShellContent>...</AppShellContent>\n  <TabBar>...</TabBar>\n</AppShell>`}>
            <div className="h-32">
              <AppShell>
                <AppShellHeader>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">myapp</span>
                  <ThemeButton color={themeColor} dark={dark} onClick={() => {}} />
                </AppShellHeader>
                <AppShellContent>
                  <div className="flex items-center justify-center h-full text-xs text-zinc-400 py-2">content</div>
                </AppShellContent>
                <TabBar>
                  {navItems.slice(0, 2).map((t) => (
                    <Tab key={t.key} active={demoTab === t.key} onClick={() => setDemoTab(t.key)} label={t.label} icon={t.icon} activeColor={themeColor} />
                  ))}
                </TabBar>
              </AppShell>
            </div>
          </ComponentCard>

          <ComponentCard name="TabBar + Tab" desc="Sticky bottom navigation with active color" code={`<TabBar>\n  <Tab active={tab === "home"} onClick={() => setTab("home")}\n    label="Home" icon={<HomeIcon />} activeColor="${themeColor}" />\n</TabBar>`}>
            <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <TabBar>
                {navItems.map((t) => (
                  <Tab key={t.key} active={demoTab === t.key} onClick={() => setDemoTab(t.key)} label={t.label} icon={t.icon} activeColor={themeColor} />
                ))}
              </TabBar>
            </div>
          </ComponentCard>

          <ComponentCard name="Watermark" desc="Full-screen tiled background pattern" code={`<Watermark color="${themeColor}" text="myapp">\n  {children}\n</Watermark>`}>
            <div className="h-24 rounded-lg relative overflow-hidden" style={{ backgroundColor: themeColor }}>
              <div
                className="absolute inset-0 pointer-events-none select-none opacity-15"
                style={{
                  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><text x="5" y="25" font-family="system-ui" font-size="22" font-weight="900" fill="white">kit</text></svg>')}")`,
                  backgroundRepeat: "repeat",
                  transform: "rotate(-12deg) scale(1.5)",
                }}
              />
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="bg-white dark:bg-zinc-900 rounded-lg px-6 py-3 shadow-lg text-xs font-medium text-zinc-500">your app here</div>
              </div>
            </div>
          </ComponentCard>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>콘텐츠</SectionHeader>
        <div className="space-y-3">
          <ComponentCard name="StatChip" desc="Compact stat badge" code={`<StatChip label="Users" value={128} />`}>
            <div className="flex gap-3">
              <StatChip label="Users" value={128} />
              <StatChip label="DAU" value={42} />
              <StatChip label="Revenue" value={4200} />
            </div>
          </ComponentCard>

          <ComponentCard name="EmptyState" desc="Empty list placeholder" code={`<EmptyState message="아직 아무것도 없어요" />`}>
            <EmptyState message="아직 아무것도 없어요" />
          </ComponentCard>

          <ComponentCard name="Button" desc="Primary action button" code={`<Button onClick={fn}>시작하기</Button>`}>
            <Button onClick={() => {}}>시작하기</Button>
          </ComponentCard>

          <ComponentCard name="GrassMap" desc="GitHub-style activity heatmap" code={`<GrassMap\n  data={[{ date: "2025-01-01", count: 42 }, ...]}\n  accent="${themeColor}"\n  isDark={dark}\n/>`}>
            <GrassMap data={GRASS_DATA} accent={themeColor} isDark={dark} />
          </ComponentCard>

          <ComponentCard name="Typewriter" desc="Animated typing effect" code={`<Typewriter\n  words={["Hello", "World"]}\n  color="${themeColor}"\n/>`}>
            <p className="text-lg font-bold">
              <Typewriter words={["Build fast", "Ship faster", "Side project"]} color={themeColor} />
            </p>
          </ComponentCard>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>유틸리티</SectionHeader>
        <div className="space-y-3">
          <ComponentCard name="Tooltip" desc="Hover/tap label" code={`<Tooltip label="설명">\n  <button>hover me</button>\n</Tooltip>`}>
            <div className="flex gap-3 justify-center py-2">
              {[["🌟", "별"], ["🚀", "로켓"], ["🎯", "타겟"]].map(([em, label]) => (
                <Tooltip key={em} label={label!}>
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">{em}</div>
                </Tooltip>
              ))}
            </div>
          </ComponentCard>

          <ComponentCard name="EmojiButton + EmojiPicker" desc="Emoji selector bottom sheet" code={`<EmojiButton emoji={emoji} onClick={() => setOpen(true)} />\n<EmojiPicker open={open} onClose={() => setOpen(false)}\n  current={emoji} onSelect={setEmoji} />`}>
            <EmojiPickerDemo />
          </ComponentCard>

          <ComponentCard name="ThemeButton + ThemeDialog" desc="Color + dark mode picker" code={`<ThemeButton color={color} dark={dark} onClick={() => setOpen(true)} />\n<ThemeDialog open={open} onClose={() => setOpen(false)}\n  current={color} onSelect={setColor}\n  dark={dark} onDarkToggle={toggleDark} />`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">color 있음</span>
                <ThemeButton color={themeColor} dark={dark} onClick={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">color 없음</span>
                <ThemeButton dark={dark} onClick={() => {}} />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard name="ShareButton" desc="navigator.share → clipboard fallback" code={`import { ShareButton, useShare } from "@m1kapp/kit";\n\n// 버튼 그대로\n<ShareButton url="https://m1k.app" title="My App" />\n\n// 커스텀 UI\nconst { share, copied } = useShare({ url: "https://m1k.app" });\n<button onClick={() => share()}>{copied ? "복사됨!" : "공유"}</button>`}>
            <div className="flex flex-wrap gap-2">
              <ShareButton url="https://m1k.app" title="@m1kapp/kit" />
              <ShareButton url="https://m1k.app" label="Share" copiedLabel="Copied!" className="text-xs" />
            </div>
          </ComponentCard>

          <ComponentCard name="Avatar" desc="이니셜 또는 이미지 아바타" code={`<Avatar fallback="MH" size="md" shape="circle" color="${themeColor}" />\n<Avatar src="/photo.jpg" fallback="MH" size="lg" shape="rounded" />`}>
            <div className="flex items-end gap-3 flex-wrap">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
                <Avatar key={s} fallback="KT" size={s} color={themeColor} />
              ))}
              <Avatar fallback="KT" size="md" shape="rounded" color={themeColor} />
              <Avatar fallback="🚀" size="md" color="#3f3f46" />
            </div>
          </ComponentCard>

          <ComponentCard name="Badge" desc="상태·카테고리 레이블 칩" code={`<Badge variant="green">LIVE</Badge>\n<Badge variant="red">오류</Badge>\n<Badge variant="blue">정보</Badge>`}>
            <div className="flex flex-wrap gap-1.5">
              {(["default", "green", "red", "yellow", "blue", "purple", "orange"] as const).map((v) => (
                <Badge key={v} variant={v}>{v}</Badge>
              ))}
            </div>
          </ComponentCard>

          <ToastDemo themeColor={themeColor} />
          <LocalStorageDemo />
          <SkeletonDemo />
          <DialogDemo themeColor={themeColor} />
          <DebounceDemo themeColor={themeColor} />
          <FormSubmitDemo themeColor={themeColor} />
          <UtilsDemo />

          <ComponentCard name="colors" desc="Curated color palette" code={`import { colors } from "@m1kapp/kit";\n<Tab activeColor={colors.blue} />`}>
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {ALL_COLORS.map((t) => (
                <div key={t.color} className="flex flex-col items-center gap-1.5">
                  <button
                    className="relative w-11 h-11 rounded-full transition-all hover:scale-110 active:scale-95"
                    onClick={() => onThemeSelect(t.color)}
                    style={{ backgroundColor: t.color, boxShadow: themeColor === t.color ? `0 0 0 2px #fff, 0 0 0 4px ${t.color}` : `0 0 0 1.5px rgba(255,255,255,0.5)` }}
                  >
                    {themeColor === t.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                  <span className="text-[9px] text-zinc-400 capitalize">{t.name}</span>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   OG Preview (scaled render)
══════════════════════════════════════════════ */
function OGPreview({ props, size = "default" }: { props: OGProps; size?: "default" | "square" | "icon" }) {
  const W = size === "square" ? 1200 : size === "icon" ? 512 : 1200;
  const H = size === "square" ? 1200 : size === "icon" ? 512 : 630;
  const SCALE = 0.295;
  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg"
      style={{ width: W * SCALE, height: H * SCALE, flexShrink: 0 }}
    >
      <div style={{ width: W, height: H, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
        <OGImage {...props} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   OG Detail
══════════════════════════════════════════════ */
type OGBg = "dark" | "gradient" | "blend";

const TEMPLATES = [
  { id: "default",  label: "Default",  size: "default" as const },
  { id: "article",  label: "Article",  size: "default" as const },
  { id: "stat",     label: "Stat",     size: "default" as const },
  { id: "product",  label: "Product",  size: "default" as const },
  { id: "match",    label: "Match",    size: "default" as const },
  { id: "square",   label: "Square",   size: "square" as const },
  { id: "icon",     label: "Icon",     size: "icon" as const },
] as const;

function getOGProps(templateId: string, color: string, bg: OGBg): OGProps {
  const base = { appName: "m1kapp", color, bg, domain: "m1k.app" };
  switch (templateId) {
    case "default":
      return { ...base, type: "default", title: "사이드 프로젝트\n시작하기", sub: "빠르게 만들고 빠르게 배우는", badge: "🚀 NEW" };
    case "article":
      return { ...base, type: "article", title: "React에서 PWA 구현하기", author: "minho", date: "2025-04-19", category: "📝 Tutorial", sub: "서비스 워커부터 설치 유도까지" };
    case "stat":
      return { ...base, type: "stat", stat: "1,000", label: "명의 방문자", sub: "론칭 3일 만에 달성", badge: "🎉 마일스톤" };
    case "product":
      return { ...base, type: "product", title: "@m1kapp/kit", tagline: "사이드 프로젝트를 위한 올인원 킷", features: ["UI 컴포넌트 18개", "OG 이미지 7가지 템플릿", "PWA 설치 유도 버튼"], badge: "v0.1.0" };
    case "match":
      return { ...base, type: "match", home: "Team A", away: "Team B", score: "2:1", sub: "2025 시즌 파이널", badge: "⚽ LIVE" };
    case "square":
      return { ...base, type: "square", title: "m1k.app", sub: "방문자 1,000명을 향한 여정", badge: "📊 Analytics" };
    case "icon":
      return { ...base, type: "icon", letter: "K" };
    default:
      return { ...base, type: "default", title: "Hello World" };
  }
}

function getOGCode(templateId: string, color: string, bg: OGBg): string {
  switch (templateId) {
    case "default":
      return `import { OGImage } from "@m1kapp/kit";
import { ImageResponse } from "next/og"; // Next.js 14+ 내장

export function GET() {
  return new ImageResponse(
    <OGImage
      type="default"
      title="사이드 프로젝트 시작하기"
      sub="빠르게 만들고 빠르게 배우는"
      badge="🚀 NEW"
      appName="m1kapp"
      color="${color}"
      bg="${bg}"
      domain="m1k.app"
    />,
    { width: 1200, height: 630 }
  );
}`;
    case "article":
      return `<OGImage
  type="article"
  title="React에서 PWA 구현하기"
  author="minho"
  date="2025-04-19"
  category="📝 Tutorial"
  sub="서비스 워커부터 설치 유도까지"
  color="${color}" bg="${bg}"
/>`;
    case "stat":
      return `<OGImage
  type="stat"
  stat="1,000"
  label="명의 방문자"
  sub="론칭 3일 만에 달성"
  badge="🎉 마일스톤"
  color="${color}" bg="${bg}"
/>`;
    case "product":
      return `<OGImage
  type="product"
  title="@m1kapp/kit"
  tagline="사이드 프로젝트를 위한 올인원 킷"
  features={[
    "UI 컴포넌트 18개",
    "OG 이미지 7가지 템플릿",
    "PWA 설치 유도 버튼",
  ]}
  badge="v0.1.0"
  color="${color}" bg="${bg}"
/>`;
    case "match":
      return `<OGImage
  type="match"
  home="Team A" away="Team B"
  score="2:1"
  sub="2025 시즌 파이널"
  badge="⚽ LIVE"
  color="${color}" bg="${bg}"
/>`;
    case "square":
      return `// 1200×1200 — Instagram / SNS 정사각형
<OGImage
  type="square"
  title="m1k.app"
  sub="방문자 1,000명을 향한 여정"
  badge="📊 Analytics"
  color="${color}" bg="${bg}"
/>
// ImageResponse: { width: 1200, height: 1200 }`;
    case "icon":
      return `// 512×512 — 앱 아이콘 / favicon
<OGImage
  type="icon"
  letter="K"
  appName="m1kapp"
  color="${color}" bg="${bg}"
/>
// ImageResponse: { width: 512, height: 512 }`;
    default:
      return "";
  }
}

function OGDetail({ themeColor }: { themeColor: string }) {
  const [templateId, setTemplateId] = useState<string>("default");
  const [bg, setBg] = useState<OGBg>("dark");

  const current = TEMPLATES.find((t) => t.id === templateId)!;
  const ogProps = getOGProps(templateId, themeColor, bg);
  const code = getOGCode(templateId, themeColor, bg);

  const bgLabels: { id: OGBg; label: string }[] = [
    { id: "dark", label: "Dark" },
    { id: "gradient", label: "Gradient" },
    { id: "blend", label: "Blend" },
  ];

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Next.js Route Handler에서 OG 이미지를 코드로 생성해요.
          7가지 템플릿 × 3가지 배경 스타일을 지원해요.
        </p>
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <strong className="text-zinc-700 dark:text-zinc-300">Next.js 14+</strong>는 <code className="font-mono">next/og</code>가 내장돼 있어 별도 설치 불필요.
            그 외 환경은 <code className="font-mono">npm i @vercel/og</code>
          </p>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>템플릿 미리보기</SectionHeader>

        {/* Template selector */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                templateId === t.id
                  ? "text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              style={templateId === t.id ? { backgroundColor: themeColor } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bg selector */}
        <div className="flex gap-1.5 mb-4">
          {bgLabels.map((b) => (
            <button
              key={b.id}
              onClick={() => setBg(b.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                bg === b.id
                  ? "border-zinc-400 dark:border-zinc-500 text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-3">
          <OGPreview props={ogProps} size={current.size} />
        </div>

        {/* Size badge */}
        <p className="text-[10px] text-zinc-400 font-mono text-center mb-4">
          {current.size === "icon" ? "512 × 512" : current.size === "square" ? "1200 × 1200" : "1200 × 630"}
          {" — "}{current.label} template
        </p>

        <CodeCard title="app/og/route.tsx" code={code} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>폰트 / 이모지</SectionHeader>
        <div className="space-y-2">
          <CodeCard title="loadPretendard" code={`import { loadPretendard } from "@m1kapp/kit";

export async function GET() {
  const font = await loadPretendard();
  return new ImageResponse(<OG ... />, {
    width: 1200, height: 630,
    fonts: [font],
  });
}`} />
          <CodeCard title="createEmojiLoader" code={`import { createEmojiLoader } from "@m1kapp/kit";

const loadEmoji = createEmojiLoader("twemoji");
// ImageResponse의 이모지 fallback으로 사용`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   Fetch Detail
══════════════════════════════════════════════ */
interface Todo { id: number; title: string; completed: boolean; }

function FetchDetail({ themeColor }: { themeColor: string }) {
  // useFetch demo — public JSONPlaceholder API
  const { data, loading, error, refetch } = useFetch<Todo[]>(
    "https://jsonplaceholder.typicode.com/todos?_limit=5",
    { staleTime: 30_000, retry: 2 }
  );

  // usePolling demo — fake clock
  const pollingResult = usePolling(
    () => Promise.resolve({ time: new Date().toLocaleTimeString("ko-KR") }),
    { interval: 2000, enabled: false, pauseOnHidden: true }
  );

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          캐싱 · 중복제거 · 재시도 · 포커스 revalidate가 내장된 fetch 유틸.
          의존성 제로 — 그냥 쓰면 됩니다.
        </p>
      </Section>

      <Divider />

      {/* useFetch */}
      <Section>
        <SectionHeader>useFetch</SectionHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 font-mono">jsonplaceholder · todos</span>
              <div className="flex items-center gap-2">
                {loading && <span className="text-[10px] text-zinc-400 animate-pulse">로딩 중…</span>}
                {error && <span className="text-[10px] text-red-400">{error.message}</span>}
                <button
                  onClick={() => refetch()}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  refetch
                </button>
              </div>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading && !data && (
                <div className="px-3 py-3 space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                  ))}
                </div>
              )}
              {data?.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2.5 px-3 py-2.5">
                  <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${todo.completed ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                    {todo.completed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span className={`text-xs flex-1 ${todo.completed ? "line-through text-zinc-400" : "text-zinc-700 dark:text-zinc-300"}`}>{todo.title}</span>
                </div>
              ))}
            </div>
          </div>

          <CodeCard title="useFetch" code={`import { useFetch } from "@m1kapp/kit";

const { data, loading, error, refetch } = useFetch<Todo[]>(
  "/api/todos",
  {
    staleTime: 30_000,    // 30초 캐시
    retry: 2,             // 네트워크 오류 시 2회 재시도
    revalidateOnFocus: true, // 탭 포커스 시 자동 갱신
  }
);`} />

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "캐시", desc: "staleTime 동안 중복 요청 없음" },
              { label: "중복제거", desc: "같은 URL 동시 요청 → 1개만 실행" },
              { label: "retry", desc: "네트워크 오류 시 지수 백오프 재시도" },
              { label: "revalidate", desc: "탭 돌아오면 자동으로 최신 데이터" },
            ].map(({ label, desc }) => (
              <div key={label} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* usePolling */}
      <Section>
        <SectionHeader>usePolling</SectionHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">2초마다 갱신</p>
                <p className="text-2xl font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                  {pollingResult.data?.time ?? "--:--:--"}
                </p>
              </div>
              <button
                onClick={() => pollingResult.isRunning ? pollingResult.stop() : pollingResult.start()}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pollingResult.isRunning
                    ? "text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
                style={pollingResult.isRunning ? { backgroundColor: themeColor } : {}}
              >
                {pollingResult.isRunning ? "정지" : "시작"}
              </button>
            </div>
            {pollingResult.isRunning && (
              <p className="text-[10px] text-zinc-400 font-mono">
                탭을 숨기면 자동으로 멈춥니다 (pauseOnHidden)
              </p>
            )}
          </div>

          <CodeCard title="usePolling" code={`import { usePolling } from "@m1kapp/kit";

const { data, loading, stop, start } = usePolling(
  () => fetch("/api/match/live").then(r => r.json()),
  {
    interval: 5000,      // 5초마다
    pauseOnHidden: true, // 탭 숨기면 자동 정지
  }
);`} />
        </div>
      </Section>

      <Divider />

      {/* createApiClient */}
      <Section>
        <SectionHeader>createApiClient</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          baseURL + 공통 헤더를 한 번만 설정하면 타입 안전한 API 클라이언트가 만들어져요.
        </p>
        <div className="space-y-2">
          <CodeCard title="lib/api.ts" code={`import { createApiClient } from "@m1kapp/kit";

export const api = createApiClient("https://api.myapp.com", {
  headers: {
    Authorization: \`Bearer \${token}\`,
  },
  onError: (err) => {
    if (err.status === 401) router.push("/login");
  },
});`} />
          <CodeCard title="사용" code={`// GET — JSON 자동 파싱
const user = await api.get<User>("/users/me");

// POST — body 자동 직렬화
const post = await api.post<Post>("/posts", {
  title: "Hello",
  body: "World",
});

// 에러는 ApiError로 정규화
try {
  await api.delete("/posts/1");
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.status, e.body); // 404, { message: "Not found" }
  }
}`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   Utils Detail
══════════════════════════════════════════════ */
function UtilsDetail({ themeColor }: { themeColor: string }) {
  const now = new Date();
  const timeSamples = [
    { label: "30초 전",  date: new Date(now.getTime() - 30_000) },
    { label: "25분 전",  date: new Date(now.getTime() - 25 * 60_000) },
    { label: "3시간 전", date: new Date(now.getTime() - 3 * 3_600_000) },
    { label: "어제",     date: new Date(now.getTime() - 30 * 3_600_000) },
    { label: "5일 전",   date: new Date(now.getTime() - 5 * 86_400_000) },
    { label: "3주 전",   date: new Date(now.getTime() - 21 * 86_400_000) },
  ];
  const numSamples = [1_200, 15_000, 230_000, 1_500_000, 120_000_000];
  const priceSamples: [number, string][] = [[9_900, "KRW"], [49_000, "KRW"], [9.99, "USD"], [29.99, "USD"]];

  // useDebounce
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 400);
  const [callCount, setCallCount] = useState(0);
  useEffect(() => { if (debounced) setCallCount(c => c + 1); }, [debounced]);

  // useFormSubmit
  const [url, setUrl] = useState("");
  const { submit, loading, error, data: submitData, reset } = useFormSubmit(
    async (value: string) => {
      await new Promise(r => setTimeout(r, 1200));
      if (!value.startsWith("http")) throw new Error("URL은 http로 시작해야 해요");
      return { id: Math.random().toString(36).slice(2), url: value };
    }
  );

  // useInView
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });
  const [inViewCount, setInViewCount] = useState(0);
  useEffect(() => { if (inView) setInViewCount(c => c + 1); }, [inView]);

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          순수 유틸 함수 + 범용 훅 모음. 의존성 제로 — 어디서나 import 해서 씁니다.
        </p>
      </Section>

      <Divider />

      {/* relativeTime */}
      <Section>
        <SectionHeader>relativeTime</SectionHeader>
        <div className="rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 mb-3">
          {timeSamples.map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900">
              <span className="text-xs text-zinc-400 font-mono">{s.label}</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{relativeTime(s.date)}</span>
            </div>
          ))}
        </div>
        <CodeCard title="relativeTime" code={`import { relativeTime } from "@m1kapp/kit";\n\nrelativeTime(post.createdAt) // "3분 전"\nrelativeTime(new Date())     // "방금 전"`} />
      </Section>

      <Divider />

      {/* formatNumber / formatPrice */}
      <Section>
        <SectionHeader>formatNumber · formatPrice</SectionHeader>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {numSamples.map(n => (
            <div key={n} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{n.toLocaleString()}</span>
              <span className="text-sm font-bold" style={{ color: themeColor }}>{formatNumber(n)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {priceSamples.map(([n, c]) => (
            <div key={`${n}-${c}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">{c}</span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatPrice(n, c)}</span>
            </div>
          ))}
        </div>
        <CodeCard title="formatNumber · formatPrice" code={`formatNumber(15_000)      // "1.5만"\nformatNumber(1_500_000)   // "150만"\nformatPrice(9_900)         // "₩9,900"\nformatPrice(9.99, "USD")   // "$9.99"`} />
      </Section>

      <Divider />

      {/* useDebounce */}
      <Section>
        <SectionHeader>useDebounce</SectionHeader>
        <div className="space-y-3 mb-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="검색어 입력..."
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
            style={{ fontSize: "16px" }}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <p className="text-[10px] text-zinc-400 mb-1">실시간 value</p>
              <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate">{input || "—"}</p>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <p className="text-[10px] text-zinc-400 mb-1">400ms 후 (API 호출)</p>
              <p className="text-sm font-mono truncate" style={{ color: themeColor }}>{debounced || "—"}</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">실제 API 호출 횟수: {callCount}회</p>
        </div>
        <CodeCard title="useDebounce" code={`const debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  if (debouncedQuery) search(debouncedQuery); // 멈출 때만 실행\n}, [debouncedQuery]);`} />
      </Section>

      <Divider />

      {/* useFormSubmit */}
      <Section>
        <SectionHeader>useFormSubmit</SectionHeader>
        <div className="space-y-3 mb-3">
          {submitData ? (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">등록 완료!</p>
                <p className="text-[10px] text-green-600 dark:text-green-500 font-mono mt-0.5">{submitData.url}</p>
              </div>
              <button onClick={reset} className="text-xs text-green-600 dark:text-green-400 hover:underline">초기화</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); submit(url); }} className="space-y-2">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 placeholder:text-zinc-400"
                style={{ fontSize: "16px" }}
              />
              {error && <p className="text-xs text-red-500 px-1">{error.message}</p>}
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                {loading ? "등록 중…" : "등록"}
              </button>
            </form>
          )}
        </div>
        <CodeCard title="useFormSubmit" code={`const { submit, loading, error } = useFormSubmit(\n  async (url: string) => api.post("/api/sites", { url }),\n  { onSuccess: () => router.push("/dashboard") }\n);\n\n// try/catch/finally/setLoading 전부 사라짐`} />
      </Section>

      <Divider />

      {/* useInView */}
      <Section>
        <SectionHeader>useInView</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          무한스크롤 트리거, 레이지 로드, 등장 애니메이션에 사용해요.
        </p>
        <div className="space-y-3 mb-3">
          <div className="h-32 overflow-y-auto rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 space-y-2">
            <p className="text-xs text-zinc-400">⬇ 스크롤 내리면 감지</p>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center px-3">
                <span className="text-xs text-zinc-500">아이템 {i + 1}</span>
              </div>
            ))}
            <div
              ref={inViewRef}
              className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-colors ${
                inView ? "text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
              }`}
              style={inView ? { backgroundColor: themeColor } : {}}
            >
              {inView ? "👁 감지됨!" : "센티넬 (여기가 보이면 트리거)"}
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">감지 횟수: {inViewCount}회</p>
        </div>
        <CodeCard title="useInView" code={`const { ref, inView } = useInView({ threshold: 0.1 });\n\nuseEffect(() => {\n  if (inView) fetchNextPage();\n}, [inView]);\n\n<div ref={ref} /> {/* 리스트 맨 아래 */}`} />
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   PWA Detail
══════════════════════════════════════════════ */
function InstallDemo({ iconBg, iconText, radius }: { iconBg: string; iconText: string; radius: number }) {
  const { state } = usePWAInstall();
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const iconSrc = svgIcon(iconText || "App", { size: 192, bg: iconBg, radius });

  const stateInfo: Record<typeof state, { badge: string; color: string; desc: string }> = {
    "android-ready": { badge: "Android 준비됨", color: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400", desc: "버튼을 누르면 Chrome 네이티브 설치 다이얼로그가 표시돼요." },
    "ios-safari":    { badge: "iOS Safari 감지됨", color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400", desc: "버튼을 누르면 홈 화면 추가 안내 시트가 열려요." },
    "installed":     { badge: "이미 설치됨", color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400", desc: "현재 standalone 모드로 실행 중이에요." },
    "unsupported":   { badge: "미지원 환경", color: "text-zinc-400 bg-zinc-100 dark:bg-zinc-800", desc: "이 브라우저에서는 설치 버튼이 표시되지 않아요." },
  };
  const { badge, color, desc } = stateInfo[state];

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${color}`}>{badge}</span>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
        <img src={iconSrc} alt="icon" className="w-12 h-12 rounded-xl shadow flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">@m1kapp/kit</p>
          <p className="text-xs text-zinc-400 mt-0.5">kit.m1k.app</p>
        </div>
        <PWAInstallButton appName="@m1kapp/kit" iconSrc={iconSrc} label="설치" installedLabel="설치됨" />
      </div>
      <button
        onClick={() => setIosSheetOpen(true)}
        className="w-full py-2.5 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
      >
        iOS 안내 시트 미리보기 →
      </button>
      <IOSInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} appName="@m1kapp/kit" iconSrc={iconSrc} />
    </div>
  );
}

function PWADetail({ themeColor }: { themeColor: string }) {
  const [iconText, setIconText] = useState("kit");
  const [iconBg, setIconBg] = useState(themeColor);
  const [radius, setRadius] = useState(0.25);

  useEffect(() => { setIconBg(themeColor); }, [themeColor]);

  const previewSrc = svgIcon(iconText || "·", { size: 192, bg: iconBg, radius });

  return (
    <>
      {/* svgIcon */}
      <Section className="pt-4">
        <SectionHeader>svgIcon() — 아이콘 생성기</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          텍스트로 SVG 아이콘을 생성해요. 이미지 파일이 필요 없어요.
        </p>
        <div className="flex items-center gap-4 mb-3">
          <img src={previewSrc} alt="preview" className="w-20 h-20 rounded-2xl shadow-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">텍스트</label>
              <input type="text" value={iconText} onChange={(e) => setIconText(e.target.value.slice(0, 4))} maxLength={4}
                className="mt-1 w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm font-mono text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2"
                style={{ fontSize: "16px" }} />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">배경색</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={iconBg} onChange={(e) => setIconBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                <code className="text-xs text-zinc-500 font-mono">{iconBg}</code>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">radius — {radius}</label>
              <input type="range" min="0" max="0.5" step="0.05" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} className="w-full mt-1" />
            </div>
          </div>
        </div>
        <CodeCard title="svgIcon()" code={`import { svgIcon } from "@m1kapp/kit";\n\nsvgIcon("${iconText || "App"}", {\n  size: 192,\n  bg: "${iconBg}",\n  radius: ${radius},\n});\n// → "data:image/svg+xml,..."`} />
      </Section>

      <Divider />

      {/* createManifest */}
      <Section>
        <SectionHeader>createManifest() — 웹 앱 매니페스트</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          <code className="font-mono">public/manifest.json</code> 대신 <code className="font-mono">app/manifest.ts</code>에서 코드로 관리해요.
        </p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 mb-3">
          <img src={svgIcon(iconText || "·", { size: 192, bg: iconBg, radius })} alt="192" className="w-10 h-10 rounded-lg" />
          <img src={svgIcon(iconText || "·", { size: 512, bg: iconBg, radius })} alt="512" className="w-14 h-14 rounded-xl" />
          <div className="text-xs text-zinc-400">
            <p>192×192 + 512×512</p>
            <p className="text-zinc-300 dark:text-zinc-600 mt-0.5">자동 생성됨</p>
          </div>
        </div>
        <CodeCard title="app/manifest.ts" code={`import { createManifest } from "@m1kapp/kit";\n\nexport default createManifest({\n  name: "My App",\n  shortName: "App",\n  themeColor: "${iconBg}",\n  icon: { text: "${iconText || "App"}" },\n});`} />
      </Section>

      <Divider />

      {/* mobileViewport */}
      <Section>
        <SectionHeader>mobileViewport — 핀치 줌 차단</SectionHeader>
        <div className="space-y-2 mb-3">
          {[
            { label: "핀치 줌 차단", desc: "CSS touch-action: pan-x pan-y (iOS 10+ 포함)" },
            { label: "인풋 자동 확대 방지", desc: "font-size: max(16px, 1em) 자동 적용" },
            { label: "Android / 구형 iOS", desc: "maximumScale=1, userScalable=false" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <CodeCard title="app/layout.tsx" code={`import { mobileViewport } from "@m1kapp/kit";\n\nexport const viewport = mobileViewport;`} />
      </Section>

      <Divider />

      {/* Install button */}
      <Section>
        <SectionHeader>PWAInstallButton — 앱 설치 유도</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          Android는 네이티브 설치 다이얼로그, iOS는 단계별 안내 시트를 자동으로 띄워요.
        </p>
        <InstallDemo iconBg={iconBg} iconText={iconText} radius={radius} />
        <div className="mt-3 space-y-2">
          <CodeCard title="PWAInstallButton" code={`import { PWAInstallButton } from "@m1kapp/kit";\n\n<PWAInstallButton\n  appName="My App"\n  iconSrc="/icon.png"\n  label="앱으로 설치"\n/>`} />
          <CodeCard title="usePWAInstall (커스텀 UI)" code={`import { usePWAInstall } from "@m1kapp/kit";\n\nconst { state, install } = usePWAInstall();\n// "android-ready" | "ios-safari" | "installed" | "unsupported"`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   Home Tab
══════════════════════════════════════════════ */
function HomeTab({ themeColor }: { themeColor: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <Section className="pt-5">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">@m1kapp/kit</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            v{__PKG_VERSION__}
          </span>
        </div>
        <p className="text-lg mt-3 min-h-7">
          <Typewriter
            words={["바이브코딩으로 만든 앱", "주말에 만든 토이 프로젝트", "해커톤에서 만든 서비스", "your side project"]}
            color={themeColor}
          />
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
          사이드 프로젝트를 위한 UI · OG · PWA 유틸리티 모음.
          <br />
          하나만 설치하면 다 됩니다.
        </p>
      </Section>

      <Section className="mt-4">
        <div className="flex gap-2">
          <a
            href="https://github.com/m1kapp/kit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-center text-sm font-semibold text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors ring-1 ring-white/10"
          >
            GitHub
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText("npm install @m1kapp/kit"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ring-1 ring-zinc-200 dark:ring-white/10"
          >
            {copied ? "Copied!" : "npm i @m1kapp/kit"}
          </button>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>구성</SectionHeader>
        <div className="space-y-2">
          {[
            { icon: "🧩", label: "UI", desc: "AppShell, TabBar, Avatar, Badge, Toast 등 24개 컴포넌트" },
            { icon: "🖼", label: "OG Image", desc: "OG 이미지 생성, 폰트·이모지 로더" },
            { icon: "📱", label: "PWA", desc: "manifest, viewport, 앱 설치 유도 버튼" },
            { icon: "🌐", label: "Fetch", desc: "캐싱·중복제거·재시도 내장 fetch — useFetch, usePolling, createApiClient" },
            { icon: "🛠", label: "Utils", desc: "relativeTime, formatNumber, formatPrice, cn + 훅 모음" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>한눈에 보기</SectionHeader>
        <div className="flex gap-3">
          <StatChip label="컴포넌트" value={24} />
          <StatChip label="유틸·훅" value={12} />
          <StatChip label="의존성" value={0} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}

/* ══════════════════════════════════════════════
   Libraries Tab (list + detail)
══════════════════════════════════════════════ */
function LibrariesTab({ themeColor, dark, onThemeSelect }: {
  themeColor: string; dark: boolean; onThemeSelect: (c: string) => void;
}) {
  const [detail, setDetail] = useState<"ui" | "og" | "pwa" | "fetch" | "utils" | null>(null);

  const detailTitle = { ui: "UI", og: "OG Image", pwa: "PWA", fetch: "Fetch", utils: "Utils" };

  return (
    <>
      {/* Header override — back button when in detail */}
      {detail && (
        <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => setDetail(null)}
            className="-ml-1 p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <BackIcon />
          </button>
          <span className="font-black text-zinc-900 dark:text-white">{detailTitle[detail]}</span>
        </div>
      )}

      <div key={detail ?? "list"}>
        {!detail && <LibraryList themeColor={themeColor} onSelect={setDetail} />}
        {detail === "ui"    && <UIDetail themeColor={themeColor} dark={dark} onThemeSelect={onThemeSelect} />}
        {detail === "og"    && <OGDetail themeColor={themeColor} />}
        {detail === "pwa"   && <PWADetail themeColor={themeColor} />}
        {detail === "fetch" && <FetchDetail themeColor={themeColor} />}
        {detail === "utils" && <UtilsDetail themeColor={themeColor} />}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   Main App
══════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState<"home" | "libraries">("home");
  const [themeColor, setThemeColor] = useState<string>(colors.blue);
  const [themeOpen, setThemeOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <ToastProvider>
      <Watermark
        color={themeColor}
        text="kit"
        sponsor={{ name: "@m1kapp/kit", url: "https://github.com/m1kapp/kit" }}
      >
        <AppShell>
          <AppShellHeader>
            <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              @m1kapp/kit
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://www.npmjs.com/package/@m1kapp/kit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 ring-1 ring-red-200 dark:ring-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#cc3534" role="img" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0v24h24V0H0zm6.672 19.992H4.008V8.004h2.664v11.988zm8.004 0h-2.664v-9.33h-2.664v9.33H6.684V4.008h13.32v15.984h-5.328zm5.328-13.32h-2.664V4.008h2.664v2.664z"/>
                </svg>
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 font-mono">
                  v{__PKG_VERSION__}
                </span>
              </a>
              <a href="https://m1k.app/gh" target="_blank" rel="noopener noreferrer">
                <img alt="Hits" src="https://m1k.app/badge/gh.svg" />
              </a>
              <ThemeButton color={themeColor} dark={dark} onClick={() => setThemeOpen(true)} />
            </div>
          </AppShellHeader>

          <AppShellContent key={tab}>
            {tab === "home"      && <HomeTab themeColor={themeColor} />}
            {tab === "libraries" && <LibrariesTab themeColor={themeColor} dark={dark} onThemeSelect={setThemeColor} />}
          </AppShellContent>

          <TabBar>
            <Tab
              active={tab === "home"}
              onClick={() => setTab("home")}
              label="홈"
              activeColor={themeColor}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
            />
            <Tab
              active={tab === "libraries"}
              onClick={() => setTab("libraries")}
              label="라이브러리"
              activeColor={themeColor}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>}
            />
          </TabBar>
        </AppShell>
      </Watermark>

      <ThemeDialog
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        current={themeColor}
        onSelect={setThemeColor}
        dark={dark}
        onDarkToggle={() => setDark((v) => !v)}
      />
    </ToastProvider>
  );
}
