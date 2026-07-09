import { useState } from "react";
import {
  Stepper, Collapsible, CopyButton, CodeBlock, Select, ColorPicker,
  InlineEdit, BarList, ProgressRing, Countdown, Carousel, Img,
  formatDuration, groupByDay,
} from "@m1kapp/kit";
import { ComponentCard } from "../shared";

export function MoreComponentsDemo({ themeColor }: { themeColor: string }) {
  const [step, setStep] = useState(1);
  const [openCard, setOpenCard] = useState<number | null>(1);
  const [sel, setSel] = useState<string | null>("beginner");
  const [picked, setPicked] = useState(themeColor);
  const [editName, setEditName] = useState("내 프로젝트");
  const [slide, setSlide] = useState(0);
  const now = Date.now();
  const logItems = [
    { id: 1, t: now, text: "오늘 항목 A" },
    { id: 2, t: now - 3600_000, text: "오늘 항목 B" },
    { id: 3, t: now - 86400_000, text: "어제 항목" },
    { id: 4, t: now - 3 * 86400_000, text: "사흘 전 항목" },
  ];
  const groups = groupByDay(logItems, (i) => i.t);
  const slides = ["🎨 디자인", "💻 개발", "🚀 배포"];

  return (
    <div className="space-y-3" style={{ ["--kit-accent" as string]: themeColor } as React.CSSProperties}>
      <ComponentCard name="Stepper" desc="다단계 진행 표시 (wonblog + aibook)" code={`<Stepper current={step} onStepClick={setStep} steps={[\n  { label: "분석", icon: "📝" }, { label: "준비", icon: "📸" }, { label: "생성", icon: "✨" },\n]} />`}>
        <Stepper current={step} onStepClick={setStep} steps={[{ label: "분석", icon: "📝" }, { label: "준비", icon: "📸" }, { label: "생성", icon: "✨" }]} />
      </ComponentCard>

      <ComponentCard name="Collapsible" desc="접기 카드 (헤더+배지+상태)" code={`<Collapsible leading={1} title="페르소나 분석" subtitle="스타일 파악"\n  open={open} onToggle={toggle} completed>…</Collapsible>`}>
        <div className="space-y-1.5">
          {[1, 2, 3].map((n) => (
            <Collapsible key={n} leading={n} title={`단계 ${n}`} subtitle="탭하여 펼치기" completed={n < (openCard ?? 0)} open={openCard === n} onToggle={() => setOpenCard(openCard === n ? null : n)}>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">단계 {n}의 본문 내용입니다.</p>
            </Collapsible>
          ))}
        </div>
      </ComponentCard>

      <ComponentCard name="CopyButton · CodeBlock" desc="클릭복사 + 피드백 (m1k)" code={`<CopyButton text="npm i @m1kapp/kit">설치 복사</CopyButton>\n<CodeBlock label="install" code="npm i @m1kapp/kit" />`}>
        <div className="space-y-2">
          <CopyButton text="npm i @m1kapp/kit">설치 명령 복사</CopyButton>
          <CodeBlock label="install" code="npm i @m1kapp/kit" />
        </div>
      </ComponentCard>

      <ComponentCard name="Select" desc="앵커드 드롭다운 + 카운트/비활성 (promptwing)" code={`<Select value={v} onChange={setV} placeholder="난이도"\n  options={[{ value: "a", label: "초급", count: 12 }, { value: "b", label: "고급", count: 0, disabled: true }]} />`}>
        <Select value={sel} onChange={setSel} placeholder="난이도" options={[{ value: "beginner", label: "초급", count: 12 }, { value: "inter", label: "중급", count: 5 }, { value: "adv", label: "고급", count: 0, disabled: true }]} />
      </ComponentCard>

      <ComponentCard name="ColorPicker" desc="프리셋 스와치 + 커스텀 hex (m1k)" code={`<ColorPicker value={color} onChange={setColor} />`}>
        <ColorPicker value={picked} onChange={setPicked} />
      </ComponentCard>

      <ComponentCard name="InlineEdit" desc="탭하여 편집 (roletodo)" code={`<InlineEdit value={name} onChange={setName} className="text-base font-bold" />`}>
        <InlineEdit value={editName} onChange={setEditName} className="text-base font-bold text-zinc-800 dark:text-zinc-200" />
      </ComponentCard>

      <ComponentCard name="BarList" desc="가로 막대 분석 차트 (m1k)" code={`<BarList items={[{ label: "/", value: 120 }, { label: "/about", value: 64 }]} />`}>
        <BarList items={[{ label: "/", value: 120 }, { label: "/about", value: 64, href: "#" }, { label: "/blog", value: 31 }]} />
      </ComponentCard>

      <ComponentCard name="ProgressRing · Countdown" desc="원형 진행률 (aibook) · 카운트다운 (modelkombat)" code={`<ProgressRing value={7} max={10}>…</ProgressRing>\n<Countdown to="2026-12-31" />`}>
        <div className="flex items-center gap-6">
          <ProgressRing value={7} max={10}><span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">7</span></ProgressRing>
          <Countdown to="2026-12-31" hideZeroDays />
        </div>
      </ComponentCard>

      <ComponentCard name="Carousel" desc="스와이프 롤러 + 점 인디케이터 (roletodo)" code={`<Carousel count={items.length} index={i} onChange={setI}>\n  <Slide item={items[i]} />\n</Carousel>`}>
        <Carousel count={slides.length} index={slide} onChange={setSlide}>
          <div className="text-center text-lg font-bold text-zinc-800 dark:text-zinc-200">{slides[slide]}</div>
        </Carousel>
      </ComponentCard>

      <ComponentCard name="Img" desc="다중 URL 폴백 이미지 (m1k + promptwing)" code={`<Img candidates={[urlA, urlB]} fallback={<div>이미지 없음</div>} />`}>
        <div className="flex items-center gap-3">
          <Img candidates={["https://invalid.example/x.png"]} fallback={<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">폴백</div>} className="h-12 w-12 rounded-lg" />
          <span className="text-xs text-zinc-400">깨진 URL → 폴백 표시</span>
        </div>
      </ComponentCard>

      <ComponentCard name="formatDuration · groupByDay" desc="유틸 — 소요시간 포맷 / 날짜별 그룹핑" code={`formatDuration(90000)            // "1분 30초"\nformatDuration(3661000, { style: "clock" }) // "1:01:01"\ngroupByDay(items, i => i.timestamp) // [{ label: "오늘", items }, …]`}>
        <div className="space-y-2">
          <div className="flex gap-2 text-xs">
            <span className="rounded bg-zinc-100 px-2 py-1 font-mono dark:bg-zinc-800">{formatDuration(90000)}</span>
            <span className="rounded bg-zinc-100 px-2 py-1 font-mono dark:bg-zinc-800">{formatDuration(3661000, { style: "clock" })}</span>
          </div>
          {groups.map((g) => (
            <div key={g.date}>
              <p className="text-[11px] font-bold text-zinc-400">{g.label} · {g.items.length}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">{g.items.map((i) => i.text).join(", ")}</p>
            </div>
          ))}
        </div>
      </ComponentCard>
    </div>
  );
}
