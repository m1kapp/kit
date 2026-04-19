# @m1kapp/kit

사이드 프로젝트를 위한 UI · OG · PWA · Fetch · Utils 올인원 킷.

[![npm](https://img.shields.io/npm/v/@m1kapp/kit)](https://www.npmjs.com/package/@m1kapp/kit) <a href="https://m1k.app/gh"><img alt="Hits" src="https://m1k.app/badge/gh.svg"/></a>

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

| 모듈 | import | 설명 |
|---|---|---|
| UI | `@m1kapp/kit` | 컴포넌트 24개 + 훅 |
| OG Image | `@m1kapp/kit` | OG 이미지 생성 (서버) |
| PWA | `@m1kapp/kit` | manifest, viewport, 설치 유도 |
| Fetch | `@m1kapp/kit` | 캐싱·중복제거·재시도 fetch 유틸 |
| Utils | `@m1kapp/kit` | 날짜·숫자 포맷, 범용 훅 |
| **Server** | `@m1kapp/kit/server` | Next.js API route 핸들러 유틸 |

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

### 워터마크

```tsx
import { Watermark } from "@m1kapp/kit";

<Watermark color="#3b82f6" text="myapp">
  {children}
</Watermark>
```

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

iOS 10+에서 핀치 줌과 인풋 자동 확대를 막습니다.

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

---

## Utils

순수 함수 — 의존성 없음, 어디서나 import.

```ts
import { relativeTime, formatNumber, formatPrice, cn } from "@m1kapp/kit";

// 상대 시간
relativeTime(post.createdAt)               // "3분 전", "어제", "2025. 4. 19."

// 숫자 포맷
formatNumber(1_500)                        // "1.5천"
formatNumber(15_000)                       // "1.5만"
formatNumber(150_000_000)                  // "1.5억"

// 가격 포맷
formatPrice(9_900)                         // "₩9,900"
formatPrice(9.99, "USD")                   // "$9.99"

// 조건부 클래스
cn("base", isActive && "active", err && "border-red-500")
// → "base active"
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
