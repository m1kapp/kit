import { useState, useEffect } from "react";
import { CheckIcon, HomeIcon, LineIcon } from "./shared";
import {
  Watermark, AppShell, AppShellHeader, AppShellContent,
  TabBar, Tab, Fab, Dialog, ToastProvider, useShare, colors,
} from "@m1kapp/kit";
import { HomeTab } from "./tabs/HomeTab";
import { LibrariesTab } from "./tabs/LibrariesTab";
import { TemplatesTab } from "./tabs/TemplatesTab";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
type View = "list" | "ui" | "og" | "pwa" | "fetch" | "utils" | "server" | "seo";

/* ══════════════════════════════════════════════
   Main App
══════════════════════════════════════════════ */
const THEME_COLOR = colors.cyan;

const SHARE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?utm_source=share&utm_medium=button&utm_campaign=m1kapp_kit`
    : "https://github.com/m1kapp/kit";

function HeaderShareButton() {
  const { share, copied } = useShare({
    url: SHARE_URL,
    title: "@m1kapp/kit",
    text: "사이드 프로젝트를 빠르게 완성하는 React UI 킷",
  });
  return (
    <button
      onClick={() => share()}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white active:scale-95 transition-all"
    >
      {copied ? (
        <CheckIcon size={13} className="text-green-400" />
      ) : (
        <LineIcon size={13}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></LineIcon>
      )}
      {copied ? "복사됨" : "공유"}
    </button>
  );
}

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function App() {
  const [tab, setTab] = useState<"home" | "libraries" | "templates">("home");
  const [fabDialogOpen, setFabDialogOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ToastProvider>
      <Watermark
        color={THEME_COLOR}
        text="kit"
        sponsor={{ name: "@m1kapp/kit", url: "https://github.com/m1kapp/kit" }}
        trackSlug="gh"
        claimed
        counts={{ today: 1, total: 120 }}
      >
        <AppShell>
          <AppShellHeader>
            <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              @m1kapp/kit
            </span>
            <div className="flex items-center gap-2">
              <HeaderShareButton />
            </div>
          </AppShellHeader>

          <AppShellContent key={tab}>
            {tab === "home"      && <HomeTab themeColor={THEME_COLOR} onGoToLibraries={() => setTab("libraries")} />}
            {tab === "libraries" && <LibrariesTab themeColor={THEME_COLOR} />}
            {tab === "templates" && <TemplatesTab themeColor={THEME_COLOR} />}
            <Fab
              onClick={() => setFabDialogOpen(true)}
              icon={<HeartIcon />}
              label="좋아요"
              color={THEME_COLOR}
            />
            <Dialog open={fabDialogOpen} onClose={() => setFabDialogOpen(false)} title={liked ? "감사합니다!" : "@m1kapp/kit"}>
              <div className="flex flex-col items-center gap-4 py-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ backgroundColor: liked ? THEME_COLOR : undefined, color: liked ? "#fff" : "#a1a1aa" }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {liked ? "좋아요를 눌러주셨어요 :)" : "하트를 눌러보세요!"}
                </p>
              </div>
            </Dialog>
          </AppShellContent>

          <TabBar>
            <Tab
              active={tab === "home"}
              onClick={() => setTab("home")}
              label="홈"
              activeColor={THEME_COLOR}
              icon={<HomeIcon size={20} />}
            />
            <Tab
              active={tab === "libraries"}
              onClick={() => setTab("libraries")}
              label="라이브러리"
              activeColor={THEME_COLOR}
              icon={<LineIcon size={20}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></LineIcon>}
            />
            <Tab
              active={tab === "templates"}
              onClick={() => setTab("templates")}
              label="템플릿"
              activeColor={THEME_COLOR}
              icon={<LineIcon size={20}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></LineIcon>}
            />
          </TabBar>
        </AppShell>
      </Watermark>

    </ToastProvider>
  );
}