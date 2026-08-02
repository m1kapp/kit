import { useEffect, useState } from "react";
import {
  AppShell, AppShellHeader, AppShellContent, Watermark,
  Section, SectionHeader, Divider, StatChip, ListRow, EmptyState, Avatar, Badge,
  TabBar, Tab, Fab,
  ThemeButton, ThemeDialog,
} from "@m1kapp/kit";

type Item = { id: number; title: string; sub: string };

const SEED: Item[] = [
  { id: 1, title: "첫 항목", sub: "여기를 지우고 진짜 데이터를 넣으세요" },
  { id: 2, title: "두 번째 항목", sub: "ListRow는 lead/sub/trailing을 받습니다" },
];

// 아래 세 줄은 지워도 되는 온보딩 체크리스트다 — 진짜로 해야 할 일을 담고 있으니
// UI 컴포넌트 조합 예시로도, 실제 다음 단계 안내로도 쓴다.
const NEXT_STEPS = [
  { title: "테마 컬러 바꿔보기", sub: "우측 상단 아이콘 → 색상 선택", badge: "UI" },
  { title: "이 목업 데이터를 실제 데이터로", sub: "App.tsx의 SEED 배열을 교체", badge: "App.tsx" },
  { title: "배포하고 방문자 트래커 잇기", sub: "npx m1kkit track <url> --write", badge: "CLI" },
];

export default function App() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [dark, setDark] = useState(false);
  // `<string>`을 명시한다 — 리터럴 타입으로 좁혀지면 ThemeDialog의
  // `onSelect={setThemeColor}` 가 TS2322로 빌드를 깬다.
  const [themeColor, setThemeColor] = useState<string>("__COLOR__");
  const [tab, setTab] = useState<"home" | "list">("home");
  const [items, setItems] = useState<Item[]>(SEED);

  // `dark:` tailwind variants only fire under a `.dark` ancestor — kit doesn't
  // apply this for you, ThemeDialog just reports/toggles the boolean.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const add = () =>
    setItems((prev) => [...prev, { id: Date.now(), title: `항목 ${prev.length + 1}`, sub: "새로 추가됨" }]);

  const lastAddedId = items.length > SEED.length ? items[items.length - 1].id : null;

  const renderItem = (it: Item) => (
    <ListRow
      key={it.id}
      lead={<Avatar fallback={it.title.slice(0, 1)} size="sm" color={themeColor} />}
      title={it.title}
      sub={it.sub}
      trailing={it.id === lastAddedId ? <Badge variant="green" size="sm">NEW</Badge> : undefined}
    />
  );

  return (
    // trackSlug — `npx m1kkit track <배포URL> --write` 가 .env 에 VITE_M1K_SLUG 를 쓴다.
    // env를 kit 안에서 읽지 않고 여기서 넘기는 이유: Vite는 `import.meta.env` 를
    // 앱 소스에서만 치환하고, node_modules/.vite/deps 안에서는 안 해준다.
    // 값이 없으면 undefined → 집계 꺼짐(기본값).
    <Watermark trackSlug={import.meta.env.VITE_M1K_SLUG} color={themeColor} text="__TITLE__">
      <AppShell accent={themeColor}>
        <AppShellHeader>
          <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            __TITLE__
          </span>
          <ThemeButton color={themeColor} dark={dark} onClick={() => setThemeOpen(true)} />
        </AppShellHeader>

        <AppShellContent>
          {tab === "home" ? (
            <>
              <Section className="pt-4">
                <div className="flex gap-2">
                  <StatChip label="전체" value={items.length} />
                  <StatChip label="오늘" value={0} />
                </div>
              </Section>

              <Divider spacing="sm" />

              <Section>
                <SectionHeader>시작하기</SectionHeader>
                <div className="flex flex-col gap-2">
                  {NEXT_STEPS.map((step, i) => (
                    <ListRow
                      key={step.title}
                      lead={<Avatar fallback={String(i + 1)} size="sm" color={themeColor} />}
                      title={step.title}
                      sub={step.sub}
                      trailing={<Badge size="sm">{step.badge}</Badge>}
                    />
                  ))}
                </div>
              </Section>

              <Divider spacing="sm" />

              <Section className="pb-4">
                <SectionHeader>최근 추가</SectionHeader>
                <div className="flex flex-col gap-2">
                  {items.slice(-3).reverse().map(renderItem)}
                </div>
              </Section>
            </>
          ) : (
            <Section className="pt-4 pb-4">
              <SectionHeader>전체 목록</SectionHeader>
              {items.length === 0 ? (
                <EmptyState message="여기에 추가한 항목이 쌓여요" icon={<span className="text-3xl">🗂️</span>} />
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map(renderItem)}
                </div>
              )}
            </Section>
          )}

          <Fab onClick={add} icon={<span>＋</span>} label="추가" color={themeColor} />
        </AppShellContent>

        <TabBar>
          <Tab active={tab === "home"} onClick={() => setTab("home")} icon={<span>🏠</span>} label="홈" activeColor={themeColor} />
          <Tab active={tab === "list"} onClick={() => setTab("list")} icon={<span>📋</span>} label="목록" activeColor={themeColor} />
        </TabBar>
      </AppShell>

      <ThemeDialog
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        current={themeColor}
        onSelect={setThemeColor}
        dark={dark}
        onDarkToggle={() => setDark((d) => !d)}
      />
    </Watermark>
  );
}
