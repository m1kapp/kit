import { useState } from "react";
import { Dialog, Button, InAppSheet } from "@m1kapp/kit";
import { ComponentCard } from "../shared";

export function DialogDemo({ themeColor }: { themeColor: string }) {
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

export function InAppSheetDemo({ themeColor }: { themeColor: string }) {
  const [openType, setOpenType] = useState<"default" | "full" | null>(null);

  const sheetContent = (onClose: () => void, full?: boolean) => (
    <div className={`px-5 pb-5 ${full ? "flex-1 flex flex-col" : ""}`}>
      <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        앱을 벗어나지 않고도 공지, 프로모션, 빠른 액션을 시트 형태로 노출할 수 있어요.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "공지", value: "in-app" },
          { label: "액션", value: "sheet" },
          { label: "영역", value: "scoped" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
            <p className="text-[10px] text-zinc-400">{item.label}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{item.value}</p>
          </div>
        ))}
      </div>
      <div className={`mt-4 flex gap-2 ${full ? "mt-auto" : ""}`}>
        <button
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-2xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          닫기
        </button>
        <button
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-2xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          확인
        </button>
      </div>
    </div>
  );

  return (
    <ComponentCard
      name="InAppSheet"
      desc="AppShell 내부에 붙는 인앱 바텀 시트 — fullHeight로 높이 제어"
      code={`<InAppSheet title="안내" open={open} onClose={() => setOpen(false)}>
  {/* fullHeight 추가하면 전체 높이 */}
</InAppSheet>`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">기본</p>
            <p className="text-[11px] text-zinc-400">콘텐츠 높이만큼</p>
          </div>
          <button
            onClick={() => setOpenType("default")}
            className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            열기
          </button>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">전체 높이</p>
            <p className="text-[11px] text-zinc-400">fullHeight</p>
          </div>
          <button
            onClick={() => setOpenType("full")}
            className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            열기
          </button>
        </div>
      </div>

      <InAppSheet title="신규 기능 안내" open={openType === "default"} onClose={() => setOpenType(null)}>
        {sheetContent(() => setOpenType(null))}
      </InAppSheet>
      <InAppSheet title="신규 기능 안내" fullHeight open={openType === "full"} onClose={() => setOpenType(null)}>
        {sheetContent(() => setOpenType(null), true)}
      </InAppSheet>
    </ComponentCard>
  );
}
