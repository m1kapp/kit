import { useState } from "react";
import {
  AppShell, AppShellHeader, AppShellContent, TabBar, Tab, ThemeButton,
  Section, SectionHeader, Divider, PoweredByKit,
  StatChip, EmptyState, Button, Typewriter,
} from "@m1kapp/kit";
import { ComponentCard, CodeCard } from "../shared";
import { GrassMapDemo } from "../sections/UIBasicDemos";
import { V030Demo } from "../sections/V030Demos";
import { NewComponentsDemo } from "../sections/NewComponentsDemo";
import { MoreComponentsDemo } from "../sections/MoreComponentsDemo";
import { UtilitySection } from "../sections/UtilitySection";

/* ══════════════════════════════════════════════
   UI Detail
══════════════════════════════════════════════ */
export function UIDetail({ themeColor }: {
  themeColor: string;
}) {
  const dark = true;
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

          <ComponentCard name="PoweredByKit" desc="Watermark에 자동 내장 — 코드 분석 기반 크레딧 시트" code={`{/* Watermark에 자동 포함 */}\n<Watermark>\n  <AppShell>...</AppShell>\n</Watermark>\n\n{/* 끄려면 */}\n<Watermark hidePoweredBy>\n  ...\n</Watermark>`}>
            <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <PoweredByKit />
            </div>
          </ComponentCard>
        </div>
      </Section>

      <Divider />

      <Section>
        <SectionHeader>신규 (v0.0.30–31)</SectionHeader>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 leading-relaxed">
          SWR 개편과 함께 추가된 컴포넌트예요. useFetch는 이제 캐시를 먼저 보여주고 백그라운드에서 갱신합니다.
        </p>
        <V030Demo themeColor={themeColor} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>신규 (v0.0.25)</SectionHeader>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 leading-relaxed">
          accent는 <code className="font-mono">--kit-accent</code> CSS 변수로 자동 연동돼요. 이 섹션은 현재 테마색을 그대로 따릅니다.
        </p>
        <NewComponentsDemo themeColor={themeColor} />
      </Section>

      <Divider />

      <Section>
        <SectionHeader>추가 공통 컴포넌트 (v0.0.25)</SectionHeader>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 leading-relaxed">
          다른 m1kapp 서비스에서 발굴해 공통화한 컴포넌트·유틸이에요.
        </p>
        <MoreComponentsDemo themeColor={themeColor} />
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

          <GrassMapDemo themeColor={themeColor} dark={dark} />

          <ComponentCard name="Typewriter" desc="Animated typing effect" code={`<Typewriter\n  words={["Hello", "World"]}\n  color="${themeColor}"\n/>`}>
            <p className="text-lg font-bold">
              <Typewriter words={["Build fast", "Ship faster", "Side project"]} color={themeColor} />
            </p>
          </ComponentCard>
        </div>
      </Section>

      <Divider />

      <UtilitySection themeColor={themeColor} dark={dark} />

      <div className="pb-6" />
    </>
  );
}
