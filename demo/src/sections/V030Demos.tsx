import { useState, useEffect } from "react";
import {
  FetchProgress, AsyncList, Skeleton, IconButton, Input, Textarea,
  MediaCard, UnderlineTabs, Divider,
} from "@m1kapp/kit";
import { ComponentCard, RefreshIcon } from "../shared";

function UnderlineTabsCard({ themeColor }: { themeColor: string }) {
  const [tab, setTab] = useState("all");
  return (
    <ComponentCard name="UnderlineTabs" desc="언더라인 콘텐츠 필터 탭 — 하단 내비 TabBar와 별개" code={`<UnderlineTabs tabs={[{ id: "all", label: "전체" }, …]}\n  active={tab} onChange={setTab} sticky />`}>
      <UnderlineTabs
        tabs={[{ id: "all", label: "전체" }, { id: "music", label: "음악" }, { id: "trip", label: "여행" }, { id: "game", label: "게임" }]}
        active={tab}
        onChange={setTab}
        activeColor={themeColor}
      />
    </ComponentCard>
  );
}

export function V030Demo({ themeColor }: { themeColor: string }) {
  const [text, setText] = useState("");
  const [memo, setMemo] = useState("");
  const [listState, setListState] = useState<"pending" | "success" | "empty" | "error">("success");
  const [barOn, setBarOn] = useState(false);
  useEffect(() => {
    if (!barOn) return;
    const t = setTimeout(() => setBarOn(false), 3000);
    return () => clearTimeout(t);
  }, [barOn]);
  const items = listState === "empty" ? [] : ["첫 번째 항목", "두 번째 항목", "세 번째 항목"];
  return (
    <div className="space-y-3" style={{ ["--kit-accent" as string]: themeColor } as React.CSSProperties}>
      <ComponentCard name="FetchProgress" desc="상단 스윕 로딩바 — useFetch 전역 활동 자동 감지 (active로 수동 제어)" code={`// AppShell 안, 헤더 아래에 한 번만\n<FetchProgress top={56} color={accent} />\n// 수동 제어\n<FetchProgress active={revalidating} />`}>
        <div className="relative h-14 rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
          <FetchProgress active={barOn} color={themeColor} />
          <button onClick={() => setBarOn(true)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            {barOn ? "재검증 중..." : "3초 로딩바 재생 ▶"}
          </button>
        </div>
      </ComponentCard>

      <ComponentCard name="AsyncList" desc="로딩/에러/빈/성공 4상태 리스트 — useFetch status 직결" code={`const { data, status } = useFetch<Item[]>("/api/items");\n<AsyncList data={data} status={status}\n  renderItem={(v) => <Row key={v.id} {...v} />}\n  skeleton={<Skeleton className="h-8" />} skeletonCount={3} />`}>
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {(["pending", "success", "empty", "error"] as const).map((st) => (
              <button key={st} onClick={() => setListState(st)} className={`text-[10px] px-2 py-1 rounded-full border ${listState === st ? "border-zinc-400 text-zinc-700 dark:text-zinc-200" : "border-zinc-200 dark:border-zinc-700 text-zinc-400"}`}>{st}</button>
            ))}
          </div>
          <AsyncList
            data={listState === "pending" ? undefined : items}
            status={listState === "empty" ? "success" : listState === "pending" ? "pending" : listState}
            error={new Error("네트워크 오류 예시")}
            renderItem={(v) => <div key={v} className="py-2 px-3 text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-0">{v}</div>}
            skeleton={<Skeleton className="h-8 mb-1.5" />}
            skeletonCount={3}
            emptyMessage="아직 항목이 없어요"
          />
        </div>
      </ComponentCard>

      <ComponentCard name="IconButton" desc="아이콘 전용 버튼 — ghost / outline" code={`<IconButton icon={<RefreshCw size={18} />} label="새로고침" onClick={reload} />\n<IconButton variant="outline" size="lg" icon={<X />} label="닫기" />`}>
        <div className="flex items-center gap-2">
          <IconButton icon={<RefreshIcon size={14} />} label="새로고침 sm" size="sm" />
          <IconButton icon={<RefreshIcon />} label="새로고침 md" />
          <IconButton icon={<RefreshIcon size={22} />} label="새로고침 lg" size="lg" />
          <IconButton variant="outline" icon={<RefreshIcon size={14} />} label="아웃라인 sm" size="sm" />
          <IconButton variant="outline" icon={<RefreshIcon />} label="아웃라인 md" />
          <IconButton variant="outline" icon={<RefreshIcon size={22} />} label="아웃라인 lg" size="lg" />
        </div>
      </ComponentCard>

      <ComponentCard name="Input · Textarea" desc="label 없는 단독 입력 — Field와 같은 스타일 토큰" code={`<Input value={q} onChange={setQ} placeholder="검색..." onEnter={submit} />\n<Textarea value={memo} onChange={setMemo} rows={3} />`}>
        <div className="space-y-2">
          <Input value={text} onChange={setText} placeholder="검색어 입력 후 Enter" onEnter={() => setText("")} />
          <Textarea value={memo} onChange={setMemo} placeholder="메모..." rows={2} />
        </div>
      </ComponentCard>

      <ComponentCard name="MediaCard" desc="썸네일+배지 미디어 카드 (horizontal/vertical)" code={`<MediaCard thumbnail={v.thumb} badge="12:34" onClick={open}>\n  <p className="text-sm line-clamp-2">{v.title}</p>\n</MediaCard>`}>
        <MediaCard thumbnail="https://picsum.photos/seed/kit/320/180" badge="12:34" onClick={() => {}}>
          <p className="text-sm font-semibold leading-tight line-clamp-2">영상 최고의 순간을 즐기세요</p>
          <p className="text-xs text-zinc-400 mt-1">조회수 5만회 · 3시간 전</p>
        </MediaCard>
      </ComponentCard>

      <UnderlineTabsCard themeColor={themeColor} />

      <ComponentCard name="Divider spacing·color" desc="여백 프리셋 + 클래스 충돌 없는 색 지정" code={`<Divider />                       // 기본 mx-4 my-6\n<Divider spacing="none" color="rgba(239,68,68,.35)" />`}>
        <div className="text-xs text-zinc-400">
          <span>기본</span>
          <Divider />
          <span>spacing=&quot;sm&quot;</span>
          <Divider spacing="sm" />
          <span>spacing=&quot;none&quot; + color</span>
          <Divider spacing="none" color={themeColor} />
        </div>
      </ComponentCard>
    </div>
  );
}
