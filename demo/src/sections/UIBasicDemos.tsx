import { useState } from "react";
import { EmojiButton, EmojiPicker, useToast, Skeleton, Avatar, GrassMap } from "@m1kapp/kit";
import { ComponentCard, GRASS_DATA } from "../shared";

export function EmojiPickerDemo() {
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

export function ToastDemo({ themeColor }: { themeColor: string }) {
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

export function SkeletonDemo() {
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

export function GrassMapDemo({ themeColor, dark }: { themeColor: string; dark: boolean }) {
  const [binary, setBinary] = useState(false);

  return (
    <ComponentCard
      name="GrassMap"
      desc="GitHub-style activity heatmap"
      code={`<GrassMap\n  data={[{ date: "2025-01-01", count: 42 }, ...]}\n  accent="${themeColor}"\n  isDark={dark}${binary ? "\n  binary" : ""}\n/>`}
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setBinary(false)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${!binary ? "text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}
          style={!binary ? { backgroundColor: themeColor } : undefined}
        >
          그라데이션
        </button>
        <button
          onClick={() => setBinary(true)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${binary ? "text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}
          style={binary ? { backgroundColor: themeColor } : undefined}
        >
          바이너리
        </button>
      </div>
      <GrassMap data={GRASS_DATA} accent={themeColor} isDark={dark} binary={binary} />
    </ComponentCard>
  );
}
