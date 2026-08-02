import { useState } from "react";
import {
  Switch, Field, SegmentedControl, TypingIndicator, MessageList,
  ActionCard, ListRow, LinkifiedText,
} from "@m1kapp/kit";
import type { ActionCardState, ChatMessage } from "@m1kapp/kit";
import { ComponentCard } from "../shared";

export function NewComponentsDemo({ themeColor }: { themeColor: string }) {
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState<"today" | "week">("today");
  const [name, setName] = useState("민호");
  const [planState, setPlanState] = useState<ActionCardState>("pending");
  const now = Date.now();
  const msgs: ChatMessage[] = [
    { role: "user", content: "내일 3시 디자인 리뷰 잡아줘", timestamp: now - 86400_000 },
    { role: "assistant", content: "네, 잡아드릴게요.", timestamp: now - 86400_000 },
    { role: "user", content: "오늘 점심 약속도 추가해줘", timestamp: now },
  ];
  return (
    <div className="space-y-3" style={{ ["--kit-accent" as string]: themeColor } as React.CSSProperties}>
      <ComponentCard name="Switch" desc="on/off 토글 — accent 자동 연동" code={`<Switch checked={on} onChange={setOn} aria-label="알림" />`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-300">알림 받기</span>
          <Switch checked={on} onChange={setOn} aria-label="알림" />
        </div>
      </ComponentCard>

      <ComponentCard name="Field" desc="라벨드 인풋 (stacked / inline / multiline)" code={`<Field label="이름" value={name} onChange={setName} />\n<Field label="이메일" value={email} inline readOnly />`}>
        <div className="space-y-2">
          <Field label="이름" value={name} onChange={setName} placeholder="이름" />
          <Field label="이메일" value="wingedcompany@gmail.com" inline readOnly />
        </div>
      </ComponentCard>

      <ComponentCard name="SegmentedControl" desc="인라인 세그먼트 토글" code={`<SegmentedControl value={view} onChange={setView}\n  options={[{ value: "today", label: "오늘" }, { value: "week", label: "이번 주" }]} />`}>
        <SegmentedControl
          value={seg}
          onChange={setSeg}
          options={[{ value: "today", label: "오늘" }, { value: "week", label: "이번 주" }]}
        />
      </ComponentCard>

      <ComponentCard name="ChatBubble · MessageList · TypingIndicator" desc="대화 UI 세트 — dayDivider 자동" code={`<MessageList messages={msgs} dayDivider>\n  {pending && <TypingIndicator />}\n</MessageList>`}>
        <MessageList messages={msgs} dayDivider>
          <TypingIndicator />
        </MessageList>
      </ComponentCard>

      <ComponentCard name="ActionCard" desc="메시지 흐름 내 확인 카드 (propose → confirm)" code={`<ActionCard title="이렇게 기록해둘까요?" state={state}\n  items={["🗓 6/4 15:00 디자인리뷰"]}\n  onConfirm={commit} onCancel={cancel} />`}>
        <div className="space-y-2">
          <ActionCard
            title="이렇게 기록해둘까요?"
            state={planState}
            items={["🗓 6/4 15:00 디자인리뷰", "📌 6/4 (종일) 마감일"]}
            onConfirm={() => setPlanState("done")}
            onCancel={() => setPlanState("cancelled")}
          />
          <button onClick={() => setPlanState("pending")} className="text-[10px] text-zinc-400 hover:text-zinc-600">상태 초기화</button>
        </div>
      </ComponentCard>

      <ComponentCard name="ListRow" desc="시간 + 2줄, heightScale 비례 높이 · 컬러바는 bar로 opt-in" code={`// 기본은 바 없음 — 일반 목록\n<ListRow title="첫 항목" sub="설명" onClick={open} />\n\n// 색이 분류를 뜻하는 일정/간트에서만 bar를 켠다\n<ListRow bar accent="#7fc06a" lead="14:00" title="회의"\n  sub="👥 김상훈" heightScale={60 / 30} onClick={open} />`}>
        <div className="space-y-1.5">
          <ListRow title="첫 항목" sub="바 없는 기본형" onClick={() => {}} />
          <ListRow bar accent="#7fc06a" lead="09:00" title="스탠드업" sub="👥 팀 전체" trailing="● 지금" active heightScale={1} onClick={() => {}} />
          <ListRow bar accent="#5b9bd5" lead="14:00" leadSub="15:00" title="디자인 리뷰" sub="🎨 피그마 링크" heightScale={2} onClick={() => {}} />
        </div>
      </ComponentCard>

      <ComponentCard name="LinkifiedText" desc="텍스트 내 URL 자동 링크" code={`<LinkifiedText>회의록 https://docs.google.com/… meet.google.com/abc-def</LinkifiedText>`}>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          <LinkifiedText>{"회의록: https://docs.google.com/doc/123\n화상: meet.google.com/abc-defg-hij"}</LinkifiedText>
        </p>
      </ComponentCard>
    </div>
  );
}
