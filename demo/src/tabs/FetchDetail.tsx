import { useFetch, usePolling, Section, SectionHeader, Divider } from "@m1kapp/kit";
import { CodeCard } from "../shared";

/* ══════════════════════════════════════════════
   Fetch Detail
══════════════════════════════════════════════ */
interface Todo { id: number; title: string; completed: boolean; }

export function FetchDetail({ themeColor }: { themeColor: string }) {
  // useFetch demo — public JSONPlaceholder API
  const { data, loading, error, refetch } = useFetch<Todo[]>(
    "https://jsonplaceholder.typicode.com/todos?_limit=5",
    { staleTime: 30_000, retry: 2 }
  );

  // usePolling demo — fake clock
  const pollingResult = usePolling(
    () => Promise.resolve({ time: new Date().toLocaleTimeString("ko-KR") }),
    { interval: 2000, enabled: false, pauseOnHidden: true }
  );

  return (
    <>
      <Section className="pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          캐싱 · 중복제거 · 재시도 · 포커스 revalidate가 내장된 fetch 유틸.
          의존성 제로 — 그냥 쓰면 됩니다.
        </p>
      </Section>

      <Divider />

      {/* useFetch */}
      <Section>
        <SectionHeader>useFetch</SectionHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 font-mono">jsonplaceholder · todos</span>
              <div className="flex items-center gap-2">
                {loading && <span className="text-[10px] text-zinc-400 animate-pulse">로딩 중…</span>}
                {error && <span className="text-[10px] text-red-400">{error.message}</span>}
                <button
                  onClick={() => refetch()}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  refetch
                </button>
              </div>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading && !data && (
                <div className="px-3 py-3 space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                  ))}
                </div>
              )}
              {data?.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2.5 px-3 py-2.5">
                  <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${todo.completed ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                    {todo.completed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span className={`text-xs flex-1 ${todo.completed ? "line-through text-zinc-400" : "text-zinc-700 dark:text-zinc-300"}`}>{todo.title}</span>
                </div>
              ))}
            </div>
          </div>

          <CodeCard title="useFetch" code={`import { useFetch } from "@m1kapp/kit";

const { data, loading, error, refetch } = useFetch<Todo[]>(
  "/api/todos",
  {
    staleTime: 30_000,    // 30초 캐시
    retry: 2,             // 네트워크 오류 시 2회 재시도
    revalidateOnFocus: true, // 탭 포커스 시 자동 갱신
  }
);`} />

          <CodeCard title="invalidateFetch — 뮤테이션 후 갱신 (v0.0.30)" code={`import { invalidateFetch } from "@m1kapp/kit";

// POST로 데이터 바꾼 뒤, 마운트된 useFetch 훅들 강제 재조회
await fetch("/api/weekly", { method: "POST", body });
invalidateFetch("/api/weekly");
// 화면엔 기존 데이터 유지 + FetchProgress 스윕바만 지나감`} />

          <CodeCard title="postJson — POST 조회 + 캐시 키 (v0.0.30)" code={`import { useFetch, postJson } from "@m1kapp/kit";

// 캐시 키는 \`경로#식별자\` — '#' 뒤는 요청에서 잘림
const { data, status } = useFetch<Playlist[]>(
  \`/api/playlist#info:\${listId}\`,
  { fetcher: postJson({ listId, infoOnly: true }) }
);`} />

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "SWR", desc: "캐시 먼저 표시, 백그라운드 재검증 (revalidating)" },
              { label: "캐시", desc: "staleTime 동안 중복 요청 없음" },
              { label: "중복제거", desc: "같은 URL 동시 요청 → 1개만 실행" },
              { label: "retry", desc: "네트워크 오류 시 지수 백오프 재시도" },
              { label: "revalidate", desc: "탭 돌아오면 자동으로 최신 데이터" },
            ].map(({ label, desc }) => (
              <div key={label} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* usePolling */}
      <Section>
        <SectionHeader>usePolling</SectionHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">2초마다 갱신</p>
                <p className="text-2xl font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                  {pollingResult.data?.time ?? "--:--:--"}
                </p>
              </div>
              <button
                onClick={() => pollingResult.isRunning ? pollingResult.stop() : pollingResult.start()}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pollingResult.isRunning
                    ? "text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
                style={pollingResult.isRunning ? { backgroundColor: themeColor } : {}}
              >
                {pollingResult.isRunning ? "정지" : "시작"}
              </button>
            </div>
            {pollingResult.isRunning && (
              <p className="text-[10px] text-zinc-400 font-mono">
                탭을 숨기면 자동으로 멈춥니다 (pauseOnHidden)
              </p>
            )}
          </div>

          <CodeCard title="usePolling" code={`import { usePolling } from "@m1kapp/kit";

const { data, loading, stop, start } = usePolling(
  () => fetch("/api/match/live").then(r => r.json()),
  {
    interval: 5000,      // 5초마다
    pauseOnHidden: true, // 탭 숨기면 자동 정지
  }
);`} />
        </div>
      </Section>

      <Divider />

      {/* createApiClient */}
      <Section>
        <SectionHeader>createApiClient</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          baseURL + 공통 헤더를 한 번만 설정하면 타입 안전한 API 클라이언트가 만들어져요.
        </p>
        <div className="space-y-2">
          <CodeCard title="lib/api.ts" code={`import { createApiClient } from "@m1kapp/kit";

export const api = createApiClient("https://api.myapp.com", {
  headers: {
    Authorization: \`Bearer \${token}\`,
  },
  onError: (err) => {
    if (err.status === 401) router.push("/login");
  },
});`} />
          <CodeCard title="사용" code={`// GET — JSON 자동 파싱
const user = await api.get<User>("/users/me");

// POST — body 자동 직렬화
const post = await api.post<Post>("/posts", {
  title: "Hello",
  body: "World",
});

// 에러는 ApiError로 정규화
try {
  await api.delete("/posts/1");
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.status, e.body); // 404, { message: "Not found" }
  }
}`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}
