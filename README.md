# @m1kapp/kit

사이드 프로젝트를 위한 UI · OG · PWA · Fetch · Utils 올인원 킷.

[![npm](https://img.shields.io/npm/v/@m1kapp/kit)](https://www.npmjs.com/package/@m1kapp/kit) <a href="https://m1k.app/gh"><picture><source media="(prefers-color-scheme: dark)" srcset="https://m1k.app/badge/gh-dark.svg"/><img alt="Hits" src="https://m1k.app/badge/gh.svg"/></picture></a>

```bash
npm install @m1kapp/kit
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`  
**Optional:** `@vercel/og >= 0.6` (Next.js 외 환경에서 OG 이미지 생성 시)

---

## 빠른 시작

```tsx
// CSS 자동 주입 — 별도 import 불필요
import { AppShell, AppShellHeader, AppShellContent, TabBar, Tab } from "@m1kapp/kit";

export default function App() {
  return (
    <AppShell>
      <AppShellHeader>
        <h1>My App</h1>
      </AppShellHeader>
      <AppShellContent>
        {/* 콘텐츠 */}
      </AppShellContent>
      <TabBar>
        <Tab href="/" icon={<HomeIcon />} label="홈" />
      </TabBar>
    </AppShell>
  );
}
```

---

## 모듈 구성

> **하나의 import면 끝.** UI · OG · PWA · Fetch · Utils가 전부 `@m1kapp/kit` 메인 export에 들어 있습니다. `/server`만 별도 서브패스예요. 서브패스를 일일이 외울 필요 없이 `import { ... } from "@m1kapp/kit"` 하나로 다 꺼내 쓰세요.

| 모듈 | import | 설명 |
|---|---|---|
| UI | `@m1kapp/kit` | 컴포넌트 45개 + 훅 |
| OG Image | `@m1kapp/kit` | OG 이미지 생성 (서버) |
| PWA | `@m1kapp/kit` | manifest, viewport, 설치 유도 |
| Fetch | `@m1kapp/kit` | 캐싱·중복제거·재시도 fetch 유틸 |
| Utils | `@m1kapp/kit` | 날짜·숫자 포맷, 범용 훅 |
| **Server** | `@m1kapp/kit/server` | Next.js API route 핸들러 유틸 |

---

## 레시피 — 이럴 땐 이거

손으로 만들기 전에 먼저 찾아보세요. 흔한 화면은 대부분 조합으로 끝납니다.

| 하고 싶은 것 | 이렇게 |
|---|---|
| 모바일 앱 셸 | `AppShell` + `AppShellHeader` / `AppShellContent` + `TabBar`/`Tab` + `Watermark` |
| 목록 + 로딩 + 빈 화면 | `useFetch` → 로딩이면 `Skeleton`, 빈 배열이면 `EmptyState` |
| 폼 저장 후 피드백 | `useFormSubmit` + `useToast` (인라인 텍스트 대신 토스트) |
| 설정 화면 | `Section` + `Field`(`inline`) + `Switch` |
| 인라인 토글 (오늘/이번주) | `SegmentedControl` (하단 글로벌 내비는 `TabBar`) |
| 채팅 / AI 비서 | `MessageList` + `ChatBubble` + `TypingIndicator` |
| "이렇게 할까요?" 확인 | `ActionCard` (메시지 흐름 안), 모달이면 `Dialog` |
| 일정 / 타임라인 행 | `ListRow` (`sizeByMinutes`로 소요시간 비례 높이) |
| 메모 속 URL 링크 | `LinkifiedText` |
| API 호출 | `createApiClient` (`get`/`post`/`put`/`delete` + `ApiError`) |
| 주기적 갱신 | `usePolling` (`pauseOnHidden`) |
| 테마색 한 번에 | `<AppShell accent="#e2603f">` → 모든 컴포넌트가 `--kit-accent`로 따라옴 |

---

## UI

CSS가 import 시 자동 주입됩니다. 별도 스타일시트 import 불필요.

### 레이아웃

```tsx
import { AppShell, AppShellHeader, AppShellContent } from "@m1kapp/kit";

<AppShell>                    // 최대 430px 중앙 정렬 모바일 컨테이너
  <AppShellHeader>...</AppShellHeader>    // 상단 sticky 헤더
  <AppShellContent>...</AppShellContent> // 스크롤 가능한 본문
</AppShell>
```

### 내비게이션

```tsx
import { TabBar, Tab } from "@m1kapp/kit";

<TabBar>
  <Tab
    active={tab === "home"}
    onClick={() => setTab("home")}
    label="홈"
    icon={<HomeIcon />}
    activeColor="#3b82f6"   // 활성 색상 자유롭게 지정
  />
</TabBar>
```

### 데이터 표시

```tsx
import { Avatar, Badge, StatChip, EmptyState, GrassMap } from "@m1kapp/kit";

// Avatar — 이니셜 or 이미지, 이미지 로드 실패 시 이니셜로 자동 fallback
<Avatar src="/photo.jpg" fallback="MH" size="md" shape="circle" />
<Avatar fallback="MH" size="lg" shape="rounded" color="#3b82f6" />
// size: "xs" | "sm" | "md" | "lg" | "xl"
// shape: "circle" | "rounded"

// Badge — 상태/카테고리 레이블
<Badge variant="green">LIVE</Badge>
<Badge variant="red">오류</Badge>
<Badge variant="blue" size="sm">정보</Badge>
// variant: "default" | "green" | "red" | "yellow" | "blue" | "purple" | "orange"

// StatChip — 숫자 stat 뱃지
<StatChip label="방문자" value={1024} />

// EmptyState — 빈 목록 플레이스홀더
<EmptyState message="아직 아무것도 없어요" />

// GrassMap — GitHub 스타일 활동 히트맵
<GrassMap data={[{ date: "2025-04-19", count: 42 }]} accent="#3b82f6" />
```

### 스켈레톤

로딩 플레이스홀더. `className`으로 크기를 지정합니다.

```tsx
import { Skeleton } from "@m1kapp/kit";

// 텍스트 줄
<Skeleton className="h-4 w-3/4" />

// 카드 블록
<Skeleton className="h-32 w-full" rounded="xl" />

// 아바타
<Skeleton className="h-10 w-10" rounded="full" />

// 실전 패턴
function PostCardSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-10 w-10" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
```

### 모달 / 다이얼로그

backdrop 클릭, ESC 키, 스크롤 잠금 자동 처리.

```tsx
import { Dialog } from "@m1kapp/kit";

// 기본 사용
<Dialog open={open} onClose={() => setOpen(false)} title="설정">
  <p className="text-sm text-zinc-500">내용</p>
</Dialog>

// 확인 다이얼로그
<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="삭제할까요?">
  <p className="text-sm text-zinc-500">이 작업은 되돌릴 수 없어요.</p>
  <div className="flex gap-2 mt-4">
    <button onClick={handleDelete} className="...">삭제</button>
    <button onClick={() => setConfirmOpen(false)} className="...">취소</button>
  </div>
</Dialog>

// size: "sm" (기본) | "md" | "lg"
// persistent: true — backdrop 클릭 / ESC로 닫기 비활성화
```

### 인터랙션

```tsx
import { Button, Tooltip, Typewriter, EmojiButton, EmojiPicker } from "@m1kapp/kit";

<Button onClick={fn}>시작하기</Button>

<Tooltip label="설명 텍스트">
  <button>hover me</button>
</Tooltip>

<Typewriter words={["Hello", "World"]} color="#3b82f6" />

// 이모지 선택기
const [emoji, setEmoji] = useState("🏠");
const [open, setOpen] = useState(false);
<EmojiButton emoji={emoji} onClick={() => setOpen(true)} />
<EmojiPicker open={open} onClose={() => setOpen(false)} current={emoji} onSelect={setEmoji} />
```

### 공유

```tsx
import { ShareButton, useShare } from "@m1kapp/kit";

// 버튼 그대로 사용 — 모바일은 네이티브 공유, 데스크탑은 클립보드 복사
<ShareButton url="https://m1k.app" title="My App" />

// 커스텀 UI
const { share, copied, canNativeShare } = useShare({ url: "https://m1k.app" });
<button onClick={() => share()}>{copied ? "복사됨!" : "공유"}</button>
```

### 토스트

```tsx
import { ToastProvider, useToast } from "@m1kapp/kit";

// 앱 루트 감싸기
<ToastProvider>
  <App />
</ToastProvider>

// 어디서나
const toast = useToast();
toast("저장됐어요!", { variant: "success" });
toast("오류가 발생했어요.", { variant: "error", duration: 4000 });
toast("링크가 복사됐어요.");  // default (dark)
// variant: "default" | "success" | "error" | "info"
```

### 테마

다크모드 + 컬러 테마 선택기.

```tsx
import { ThemeButton, ThemeDialog, THEME_SCRIPT, colors } from "@m1kapp/kit";

// layout.tsx — 다크모드 깜빡임 방지
<head>
  <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
</head>

// 테마 버튼 + 다이얼로그
const [themeOpen, setThemeOpen] = useState(false);
<ThemeButton color={color} dark={dark} onClick={() => setThemeOpen(true)} />
<ThemeDialog
  open={themeOpen}
  onClose={() => setThemeOpen(false)}
  current={color}
  onSelect={setColor}
  dark={dark}
  onDarkToggle={() => setDark(v => !v)}
/>

// 팔레트
colors.blue    // "#3b82f6"
colors.purple  // "#a855f7"
colors.green   // "#22c55e"
// blue | purple | green | orange | pink | red | yellow | cyan | slate | zinc
```

**임의 색도 OK.** 팔레트는 프리셋일 뿐이고, `ThemeDialog`의 `palette` / `onSelect`는 어떤 hex든 받습니다. 그리고 `Switch`·`SegmentedControl`·`ChatBubble`·`ActionCard`·`ListRow`·`LinkifiedText`의 accent는 `--kit-accent` CSS 변수를 따라가므로, 한 곳만 바꾸면 전체 톤이 바뀝니다.

```tsx
// ① AppShell accent prop — 가장 쉬움 (하위 전체에 적용)
<AppShell accent="#e2603f">...</AppShell>

// ② 아무 래퍼에나 CSS 변수로
<div style={{ "--kit-accent": "#e2603f" } as React.CSSProperties}>...</div>

// ③ 컴포넌트별 override
<Switch checked={on} onChange={setOn} accent="#e2603f" />
```

### 폼 · 설정

```tsx
import { Field, Switch } from "@m1kapp/kit";

// 라벨드 인풋 (stacked 기본 / inline / multiline)
<Field label="이름" value={name} onChange={setName} placeholder="이름" />
<Field label="이메일" value={email} inline readOnly />
<Field label="메모" value={memo} onChange={setMemo} multiline rows={3} hint="자유롭게 적어주세요" />

// on/off 토글 — accent는 --kit-accent 자동 연동
<Switch checked={on} onChange={setOn} aria-label="알림" />
```

### 세그먼트 토글

```tsx
import { SegmentedControl } from "@m1kapp/kit";

<SegmentedControl
  value={view}
  onChange={setView}
  options={[{ value: "today", label: "오늘" }, { value: "week", label: "이번 주" }]}
/>
// 인라인 토글용. 하단 글로벌 내비게이션은 TabBar를 쓰세요.
```

### 채팅 / 대화

```tsx
import { MessageList, ChatBubble, TypingIndicator } from "@m1kapp/kit";
import type { ChatMessage } from "@m1kapp/kit";

const messages: ChatMessage[] = [
  { role: "user", content: "내일 3시 회의 잡아줘", timestamp: Date.now() },
  { role: "assistant", content: "네, 잡아드릴게요." },
];

// dayDivider: timestamp 기준 날짜가 바뀌면 구분선 자동 삽입
<MessageList messages={messages} dayDivider>
  {pending && <TypingIndicator />}
</MessageList>

// 직접 쓰려면
<ChatBubble role="user">오늘 일정 보여줘</ChatBubble>
<ChatBubble role="assistant">3건 있어요.</ChatBubble>
```

### 확인 카드 (propose → confirm → execute)

LLM 툴콜처럼 "제안 → 확인 → 실행" 흐름을 메시지 안에 박을 때. 모달이 아니라 흐름에 인라인됩니다.

```tsx
import { ActionCard } from "@m1kapp/kit";

const [state, setState] = useState<"pending" | "loading" | "done" | "cancelled">("pending");

<ActionCard
  title="이렇게 기록해둘까요?"
  state={state}
  items={["🗓 6/4 15:00 디자인 리뷰", "📌 6/4 (종일) 마감일"]}
  onConfirm={() => { setState("loading"); /* … */ setState("done"); }}
  onCancel={() => setState("cancelled")}
/>
// state별 색/문구 자동: pending → done(초록) / cancelled(취소선) / loading
```

### 리스트 / 타임라인 행

```tsx
import { ListRow } from "@m1kapp/kit";

<ListRow
  accent="#7fc06a"          // 왼쪽 컬러바 (생략 시 --kit-accent)
  lead="14:00" leadSub="15:00"
  title="디자인 리뷰" sub="👥 김상훈"
  trailing="● 지금" active   // 현재 항목 강조
  heightScale={60 / 30}      // 높이 배율 (1=기본, 46–130px). 일정은 분/30을 넘김
  onClick={open}
/>
```

### 텍스트 내 링크

```tsx
import { LinkifiedText } from "@m1kapp/kit";

<LinkifiedText>{"회의록: https://docs.google.com/…\n화상: meet.google.com/abc-def"}</LinkifiedText>
// http(s) URL + (기본) meet.google.com 같은 도메인/경로를 자동 링크. 줄바꿈 보존.
```

### 진행 표시 · 단계

```tsx
import { Stepper, Collapsible, ProgressRing } from "@m1kapp/kit";

// 다단계 진행 표시 (위저드/멀티페이즈 플로우)
<Stepper current={phase} onStepClick={setPhase} steps={[
  { label: "분석", icon: "📝" }, { label: "준비", icon: "📸" }, { label: "생성", icon: "✨" },
]} />

// 접기 카드 (헤더+배지+상태)
<Collapsible leading={1} title="페르소나 분석" subtitle="스타일 파악" completed
  open={open === 1} onToggle={() => setOpen(open === 1 ? null : 1)}>
  <p>본문…</p>
</Collapsible>

// 원형 진행률
<ProgressRing value={7} max={10}><span className="text-2xl font-black">7</span></ProgressRing>
```

### 입력 · 편집

```tsx
import { Select, ColorPicker, InlineEdit } from "@m1kapp/kit";

// 앵커드 드롭다운 (카운트·비활성 옵션, 외부클릭/ESC 닫힘)
<Select value={cat} onChange={setCat} placeholder="난이도" options={[
  { value: "a", label: "초급", count: 12 }, { value: "b", label: "고급", count: 0, disabled: true },
]} />

// 컬러 피커 (프리셋 + 커스텀 hex)
<ColorPicker value={color} onChange={setColor} />

// 탭하여 편집 (Enter 저장 · Esc 취소)
<InlineEdit value={name} onChange={rename} className="text-lg font-bold" />
```

### 복사 · 데이터

```tsx
import { CopyButton, CodeBlock, useCopy, BarList, Countdown, Carousel, Img } from "@m1kapp/kit";

<CopyButton text="npm i @m1kapp/kit">설치 복사</CopyButton>
<CodeBlock label="install" code="npm i @m1kapp/kit" />
const { copied, copy } = useCopy();   // keyed: copy(text, "row-3")

// 가로 막대 분석 차트
<BarList items={[{ label: "/", value: 120 }, { label: "/about", value: 64, href: "/about" }]} />

// 카운트다운 (D-day)
<Countdown to="2026-12-31" onComplete={celebrate} />

// 스와이프 캐러셀 (controlled, 점 인디케이터)
<Carousel count={slides.length} index={i} onChange={setI}>{slides[i]}</Carousel>

// 다중 URL 폴백 이미지
<Img candidates={[avatarUrl, gravatar]} fallback={<Avatar fallback="MH" />} className="h-10 w-10 rounded-full" />
```

### 워터마크

```tsx
import { Watermark } from "@m1kapp/kit";

<Watermark color="#3b82f6" text="myapp">
  {children}
</Watermark>
```

`Watermark`는 하단에 `PoweredByKit` 크레딧을 자동 내장합니다.

### 방문자 트래커 (m1k.app) — 선택, 기본 OFF

`Watermark`/`PoweredByKit` 하단 크레딧이 방문자 수를 집계할 수 있습니다. **slug가 있을 때만** 켜지고, 없으면 아무것도 전송하지 않아요(기본 off). 집계는 페이지뷰 카운트뿐 — PII 없음.

```bash
# 1) 사이트 등록 (무로그인) → slug 발급
npx m1kkit track https://myside.app
```

```bash
# 2) .env 에 한 줄 → 이후 자동 집계 (스니펫 붙여넣기 불필요)
NEXT_PUBLIC_M1K_SLUG=your-slug
```

```tsx
// 끄기 / 명시 지정
<Watermark track={false}>…</Watermark>        // 비콘 끔
<Watermark trackSlug="your-slug">…</Watermark> // env 대신 직접 지정
// PoweredByKit 단독 사용 시: <PoweredByKit slug="your-slug" track={false} />
```

> `npx m1kkit claim` 으로 익명 등록 사이트를 내 m1k.app 계정에 귀속할 수 있어요.
> (`.m1k.json`의 일회용 토큰 + 로그인으로 인증.) 귀속하는 김에 **kit이 이 프로젝트에서 코드를 얼마나 아껴줬는지** 분석도 같이 출력해요 — `--no-stats`로 끌 수 있어요.

---

## OG Image

Next.js 14+는 `next/og`가 내장되어 있어 별도 설치 불필요. 그 외 환경은 `npm i @vercel/og`.

```tsx
// app/og/route.tsx
import { OGImage, loadPretendard } from "@m1kapp/kit";
import { ImageResponse } from "next/og";

export async function GET() {
  const font = await loadPretendard();

  return new ImageResponse(
    <OGImage
      type="default"
      title="사이드 프로젝트 시작하기"
      sub="빠르게 만들고 빠르게 배우는"
      badge="🚀 NEW"
      appName="myapp"
      color="#3b82f6"
      bg="dark"          // "dark" | "gradient" | "blend"
      domain="m1k.app"
    />,
    { width: 1200, height: 630, fonts: [font] }
  );
}
```

### 템플릿

| type | 크기 | 용도 |
|---|---|---|
| `default` | 1200×630 | 기본 OG |
| `article` | 1200×630 | 블로그 포스트 — author, date, category |
| `stat` | 1200×630 | 마일스톤 — stat, label |
| `product` | 1200×630 | 제품 소개 — tagline, features[] |
| `match` | 1200×630 | 경기 결과 — home, away, score |
| `square` | 1200×1200 | Instagram / SNS |
| `icon` | 512×512 | 앱 아이콘 / favicon |

```tsx
// article
<OGImage type="article" title="제목" author="minho" date="2025-04-19" category="Tutorial" sub="부제" color={c} bg={bg} />

// stat
<OGImage type="stat" stat="1,000" label="명의 방문자" sub="론칭 3일 만에" badge="🎉" color={c} bg={bg} />

// product
<OGImage type="product" title="@m1kapp/kit" tagline="올인원 킷" features={["기능1", "기능2"]} color={c} bg={bg} />
```

### 폰트 & 이모지

```tsx
import { loadPretendard, loadGoogleFont, createEmojiLoader } from "@m1kapp/kit";

const pretendard = await loadPretendard();           // Pretendard 한국어 폰트
const roboto = await loadGoogleFont("Roboto", 700);  // Google Fonts
const loadEmoji = createEmojiLoader("twemoji");       // 이모지 fallback
```

---

## PWA

### Manifest

`public/manifest.json` 대신 코드로 관리. 아이콘 이미지 파일 불필요.

```ts
// app/manifest.ts
import { createManifest } from "@m1kapp/kit";

export default createManifest({
  name: "My App",
  shortName: "App",
  description: "What this app does",
  themeColor: "#3b82f6",      // 아이콘 배경색으로도 사용
  backgroundColor: "#ffffff",
  icon: { text: "MA" },       // 텍스트로 192×192, 512×512 SVG 아이콘 자동 생성
});
```

### Viewport — 핀치 줌 차단

iOS 10+에서 핀치 줌과 인풋 자동 확대를 막습니다. `viewportFit: "cover"`로 노치 / Dynamic Island 기기에서 safe area inset도 지원합니다.

```ts
// app/layout.tsx
import { mobileViewport } from "@m1kapp/kit";

export const viewport = mobileViewport;
```

내부적으로 CSS `touch-action: pan-x pan-y`와 `input { font-size: max(16px, 1em) }`를 자동 적용합니다.

### SVG 아이콘

```ts
import { svgIcon } from "@m1kapp/kit";

const src = svgIcon("MA", { size: 192, bg: "#3b82f6", color: "#ffffff", radius: 0.25 });
// → "data:image/svg+xml,..." — <img src={src} /> 또는 manifest icons에 바로 사용
```

### 앱 설치 유도

Android는 네이티브 설치 프롬프트, iOS는 홈 화면 추가 안내 시트를 자동으로 띄워줍니다.

```tsx
import { PWAInstallButton, IOSInstallSheet, usePWAInstall } from "@m1kapp/kit";

// 버튼 그대로 사용
<PWAInstallButton appName="My App" iconSrc={iconSrc} label="앱으로 설치" />

// 커스텀 UI
const { state, install } = usePWAInstall();
// state: "android-ready" | "ios-safari" | "installed" | "unsupported"

if (state === "android-ready") {
  return <button onClick={install}>설치</button>;
}
if (state === "ios-safari") {
  return <button onClick={() => setSheetOpen(true)}>설치</button>;
}

// iOS 안내 시트 (직접 제어 시)
<IOSInstallSheet open={sheetOpen} onClose={() => setSheetOpen(false)} appName="My App" iconSrc={iconSrc} />
```

---

## Fetch

의존성 제로. 캐싱 · 중복제거 · 재시도 · 포커스 revalidate가 내장된 fetch 유틸.

### useFetch

```tsx
import { useFetch } from "@m1kapp/kit";

const { data, loading, error, refetch } = useFetch<User[]>("/api/users", {
  staleTime: 30_000,        // 30초 캐시 — 같은 URL 중복 요청 없음
  retry: 2,                 // 네트워크 오류 시 지수 백오프로 2회 재시도
  revalidateOnFocus: true,  // 탭 돌아오면 자동 최신 데이터
});

// 로딩 처리
if (loading && !data) return <PostListSkeleton />;
if (error) return <p>{error.message}</p>;
return data?.map(u => <UserCard key={u.id} user={u} />);
```

### usePolling

실시간 데이터, 라이브 스코어 등에 사용.

```tsx
import { usePolling } from "@m1kapp/kit";

const { data, isRunning, start, stop } = usePolling(
  () => fetch("/api/match/live").then(r => r.json()),
  {
    interval: 5000,       // 5초마다
    enabled: true,        // 시작 여부
    pauseOnHidden: true,  // 탭 숨기면 자동 정지 — 불필요한 요청 없음
  }
);

<button onClick={() => isRunning ? stop() : start()}>
  {isRunning ? "정지" : "시작"}
</button>
```

### createApiClient

baseURL과 공통 헤더를 한 번만 설정하면 타입 안전한 API 클라이언트가 만들어집니다.

```ts
// lib/api.ts
import { createApiClient, ApiError } from "@m1kapp/kit";

export const api = createApiClient("https://api.myapp.com", {
  headers: { Authorization: `Bearer ${token}` },
  onError: (err) => {
    if (err.status === 401) signOut();
  },
});

// 사용
const me   = await api.get<User>("/users/me");
const post = await api.post<Post>("/posts", { title, body });
await api.put("/posts/1", { title: "수정된 제목" });
await api.delete("/posts/1");

// 에러는 ApiError로 정규화
try {
  await api.delete("/posts/1");
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.status, e.body); // 404, { error: "Not found" }
  }
}
```

---

## Server

Next.js API route 전용. `@m1kapp/kit/server`로 import — 클라이언트 번들에 포함되지 않습니다.

### handler()

try/catch 없이 에러를 처리합니다. `unauthorized()`, `notFound()` 등은 `never`를 반환하므로 TypeScript가 제어 흐름을 정확히 추론합니다.

```ts
import { handler, ok, created, unauthorized, forbidden, notFound, badRequest } from "@m1kapp/kit/server";

// Before ❌
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await db.sites.findMany({ where: { userId: user.id } });
    return Response.json(data);
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// After ✅
export const GET = handler(async () => {
  const user = await currentUser();
  if (!user) unauthorized();               // throws → 401

  const data = await db.sites.findMany({ where: { userId: user.id } });
  return ok(data);                         // 200 + JSON
  // 처리되지 않은 에러 → 500 자동
});

export const POST = handler(async (req) => {
  const user = await currentUser();
  if (!user) unauthorized();

  const { url } = await req.json();
  if (!url) badRequest("url이 필요해요");  // throws → 400

  const site = await db.sites.create({ data: { url, userId: user.id } });
  return created(site);                    // 201 + JSON
});
```

### 응답 헬퍼

| 함수 | 상태 | 설명 |
|---|---|---|
| `ok(data)` | 200 | JSON 응답 |
| `created(data)` | 201 | 생성 완료 |
| `noContent()` | 204 | 본문 없음 |
| `badRequest(msg?)` | 400 | 잘못된 요청 |
| `unauthorized(msg?)` | 401 | 인증 필요 |
| `forbidden(msg?)` | 403 | 권한 없음 |
| `notFound(msg?)` | 404 | 리소스 없음 |
| `conflict(msg?)` | 409 | 충돌 |
| `serverError(msg?)` | 500 | 서버 오류 |

### safely()

특정 에러를 try/catch 없이 처리하고 싶을 때.

```ts
import { handler, ok, serverError, safely } from "@m1kapp/kit/server";

export const GET = handler(async () => {
  const { ok: success, data, error } = await safely(() => db.users.findFirstOrThrow());
  if (!success) return serverError("DB 조회 실패");
  return ok(data);
});
```

### 서버 유틸 (의존성 0)

API 라우트에서 자주 손으로 만들던 것들 — 전부 `@m1kapp/kit/server`에 있어요.

```ts
import {
  requireEnv, fetchWithRetry, withRetry, recoverJsonFromText,
  scrapeOg, todayKST, dateInTz, idToSlug, slugToId, appHost,
} from "@m1kapp/kit/server";

// 필수 env 검증 (없으면 500 throw, 있으면 타입된 객체)
const { XAI_API_KEY } = requireEnv(["XAI_API_KEY"]);

// fetch + 타임아웃 + 429/5xx 자동 재시도 (마지막 응답 반환)
const res = await fetchWithRetry(url, { headers: { authorization: `Bearer ${XAI_API_KEY}` } });

// 아무 async나 재시도 (Neon 콜드스타트 등)
const rows = await withRetry(() => db.query.users.findMany(), {
  shouldRetry: (e) => String(e).includes("fetch failed"),
});

// LLM 응답에서 JSON 복구 (```json 펜스·트레일링 콤마·노이즈 제거)
const data = recoverJsonFromText<{ items: string[] }>(llmReply);

// Open Graph 스크래핑
const og = await scrapeOg("example.com");   // { title, description, image, siteName, url }

// 타임존 날짜
todayKST();                                  // "2026-06-04"
dateInTz(Date.now(), "America/New_York");

// base62 slug + 호스트
idToSlug(42, 1000);                          // "..."  (slugToId로 역변환)
const base = `https://${appHost("m1k.app")}`;
```

---

## Utils

순수 함수 — 의존성 없음, 어디서나 import.

```ts
import { relativeTime, formatNumber, formatPrice, cn, formatDuration, groupByDay } from "@m1kapp/kit";

// 상대 시간
relativeTime(post.createdAt)               // "3분 전", "어제", "2025. 4. 19."

// 소요 시간 포맷
formatDuration(90_000)                     // "1분 30초"
formatDuration(3_661_000, { style: "clock" }) // "1:01:01"

// 날짜별 그룹핑 — [{ date, label: "오늘"|"어제"|"4월 19일 (토)", items }]
groupByDay(logs, (l) => l.timestamp)

// 숫자 포맷
formatNumber(1_500)                        // "1.5천"
formatNumber(15_000)                       // "1.5만"
formatNumber(150_000_000)                  // "1.5억"

// 가격 포맷
formatPrice(9_900)                         // "₩9,900"
formatPrice(9.99, "USD")                   // "$9.99"

// 조건부 클래스 — Tailwind 충돌 자동 해결 (clsx + tailwind-merge 내장)
cn("base", isActive && "active", err && "border-red-500")
// → "base active"
cn("px-2 py-1", "px-4")                   // → "py-1 px-4"  (충돌 해결)
cn({ "opacity-50": disabled })             // 객체 문법 지원
```

## Hooks

```ts
import { useDebounce, useFormSubmit, useInView, useLocalStorage } from "@m1kapp/kit";
```

### useDebounce

```ts
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) searchAPI(debouncedQuery); // 타이핑 멈출 때만 실행
}, [debouncedQuery]);
```

### useFormSubmit

모든 form handler의 loading / error / try-catch / finally 보일러플레이트를 제거합니다.

```ts
const { submit, loading, error, data, reset } = useFormSubmit(
  async (url: string) => api.post<Site>("/api/sites", { url }),
  { onSuccess: (site) => router.push(`/sites/${site.id}`) }
);

<form onSubmit={e => { e.preventDefault(); submit(inputValue); }}>
  <input value={inputValue} onChange={...} />
  {error && <p className="text-red-500 text-sm">{error.message}</p>}
  <button disabled={loading}>{loading ? "등록 중…" : "등록"}</button>
</form>
```

### useInView

무한스크롤 트리거, 레이지 로드, 등장 애니메이션에 사용.

```tsx
const { ref, inView } = useInView({ threshold: 0.1, once: true });

useEffect(() => {
  if (inView) fetchNextPage();
}, [inView]);

return (
  <div>
    {posts.map(p => <PostCard key={p.id} post={p} />)}
    <div ref={ref} />  {/* 리스트 맨 아래 센티넬 */}
  </div>
);
```

### useLocalStorage

새로고침 후에도 유지되는 로컬 상태. SSR 안전.

```ts
const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");

setTheme("dark");    // localStorage에 저장
removeTheme();       // localStorage에서 삭제, 초기값으로 복원
```
