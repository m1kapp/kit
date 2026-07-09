import { useState } from "react";
import { Section, SectionHeader, Tooltip, ThemeButton, ShareButton, Avatar, Badge } from "@m1kapp/kit";
import { ComponentCard, ALL_COLORS } from "../shared";
import { EmojiPickerDemo, ToastDemo, SkeletonDemo } from "./UIBasicDemos";
import { DialogDemo, InAppSheetDemo } from "./UIOverlayDemos";
import { LocalStorageDemo, DebounceDemo, FormSubmitDemo, UtilsDemo } from "./UIHookDemos";

export function UtilitySection({ themeColor, dark }: { themeColor: string; dark: boolean }) {
  const [, onThemeSelect] = useState(themeColor); // local demo only
  return (
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
          <InAppSheetDemo themeColor={themeColor} />

          <ComponentCard name="Fab" desc="Floating Action Button — AppShell 기준 absolute bottom-right 고정" code={`<AppShellContent>\n  {content}\n  <Fab onClick={handleAdd} icon={<PlusIcon />} color="#6366f1" />\n</AppShellContent>`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">하단의 하트 버튼이 Fab 컴포넌트입니다</p>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: themeColor, color: "#fff" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
            </div>
          </ComponentCard>

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
  );
}
