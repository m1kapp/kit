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
  const [openType, setOpenType] = useState<"default" | "full" | "stack" | null>(null);

  const [brandOpen, setBrandOpen] = useState(false);
  const [size, setSize] = useState("110");

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
      desc="앱 안에서 겹쳐 여는 바텀 시트 · 뒤로가기와 이전 선택 유지"
      code={`<InAppSheet title="안내" open={open} onClose={() => setOpen(false)}>
  <button onClick={() => setBrandOpen(true)}>브랜드 고르기</button>
  <InAppSheet title="브랜드 선택" open={brandOpen} onClose={() => setBrandOpen(false)}>
    {/* 뒤 시트는 유지되고 맨 위 시트만 닫혀요 */}
  </InAppSheet>
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

      <button
        onClick={() => setOpenType("stack")}
        className="mt-3 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white"
        style={{ backgroundColor: themeColor }}
      >
        2단 시트 체험하기
      </button>
      <InAppSheet title="AI 피팅" fullHeight open={openType === "stack"} onClose={() => { setOpenType(null); setBrandOpen(false); }}>
        <div className="space-y-5 px-5 pb-5 text-zinc-900 dark:text-zinc-100">
          <p className="text-sm text-zinc-500">선택한 사이즈와 스크롤 위치는 브랜드를 보고 돌아와도 그대로예요.</p>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            사이즈
            <select aria-label="피팅 사이즈" value={size} onChange={(event) => setSize(event.target.value)} className="mt-2 block w-full rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700">
              {["100", "110", "120", "130"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <button onClick={() => setBrandOpen(true)} className="w-full cursor-pointer rounded-2xl p-4 text-left text-white" style={{ backgroundColor: themeColor }}>
            <span className="block font-semibold">브랜드 고르기 →</span>
            <span className="mt-1 block text-xs opacity-80">첫 시트를 유지한 채 다음 시트를 열어요</span>
          </button>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
              <p className="text-sm font-semibold">피팅 안내 {index + 1}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">아래로 스크롤한 뒤 브랜드를 열어 보세요. 돌아오면 읽던 위치가 유지돼요.</p>
            </div>
          ))}
          <button onClick={() => setBrandOpen(true)} className="w-full cursor-pointer rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700">아래에서 브랜드 고르기</button>
        </div>
        <InAppSheet title="브랜드 선택" fullHeight open={brandOpen && openType === "stack"} onClose={() => setBrandOpen(false)}>
          <div className="space-y-4 px-5 pb-5 text-zinc-900 dark:text-zinc-100">
            <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
              <p className="text-lg font-bold">Pause &amp; Play</p>
              <p className="mt-2 text-sm text-zinc-500">티셔츠 · 가디건 · 데일리웨어</p>
            </div>
            <label className="block text-sm font-semibold">브랜드 검색<input placeholder="브랜드 이름" className="mt-2 block w-full rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700" /></label>
            <button onClick={() => setBrandOpen(false)} className="w-full cursor-pointer rounded-xl p-3 text-sm font-semibold text-white" style={{ backgroundColor: themeColor }}>선택하고 돌아가기</button>
            <p className="text-xs leading-relaxed text-zinc-500">닫기 · Esc · 브라우저 뒤로가기는 이 시트만 닫아요. 뒤 시트는 터치와 스크롤이 잠겨요.</p>
          </div>
        </InAppSheet>
      </InAppSheet>

      <InAppSheet title="신규 기능 안내" open={openType === "default"} onClose={() => setOpenType(null)}>
        {sheetContent(() => setOpenType(null))}
      </InAppSheet>
      <InAppSheet title="신규 기능 안내" fullHeight open={openType === "full"} onClose={() => setOpenType(null)}>
        {sheetContent(() => setOpenType(null), true)}
      </InAppSheet>
    </ComponentCard>
  );
}
