---
name: m1kapp-new
description: 새로운 m1kapp 서비스 프로젝트를 스캐폴딩 — m1kkit new 로 뼈대를 만들고, 컨셉에 맞게 첫 화면을 채운다
---

`$ARGUMENTS` 위치에 새로운 m1kapp 서비스 프로젝트를 생성해줘.

**뼈대는 직접 타이핑하지 마라.** `npx m1kkit new`가 검증된 템플릿을 복사한다.
이 스킬이 파일 내용을 산문으로 받아적던 시절엔 매번 같은 자리가 깨졌다 —
`useState(colors.blue)` 리터럴 협착으로 `tsc` 실패, `vite-env.d.ts` 누락으로
`import "./index.css"` 실패, 본문이 `{/* TODO */}` 하나뿐인 빈 화면.
지금은 그게 전부 `templates/vite-app/` 안의 실제 파일로 고정되어 있고 빌드로 검증된다.

네가 할 일은 **뼈대 위에 컨셉을 얹는 것**이다.

## Step 1 — 아주 약한 grill (4문항)

한 번에 묻는다. 인자로 이미 준 건 기본값으로 채워 제안.

1. 앱 이름 (폴더명) + 화면에 뜰 이름
2. 한 줄 컨셉 — 이게 첫 화면 구성을 정한다
3. 테마 컬러 (hex, 없으면 `#3B82F6`)
4. 배포 URL — 정해졌으면 지금. 그래야 방문자 트래커가 이 자리에서 붙는다. 미정이면 미정이라고만.

## Step 2 — 뼈대 생성

```bash
npx m1kkit new <이름> --title=<화면이름> --desc=<한줄> --color=<hex> [--url=<배포URL>] --yes
```

- 생성 경로는 현재 디렉토리 하위. `/Users/minho/IdeaProjects/m1kapp/` 아래 만들 거면 거기서 실행한다.
- `--url`을 주면 `m1kkit track ... --write`까지 자동으로 돌아 `.env`에 `VITE_M1K_SLUG`가 박힌다.
- `--url` 없이 만들었으면 배포 후 프로젝트 폴더에서 한 줄:
  `npx m1kkit track <배포URL> --write`

## Step 3 — 컨셉에 맞게 첫 화면 채우기

템플릿의 `src/App.tsx`는 홈/목록 두 탭 + StatChip + ListRow + EmptyState + Fab이
더미 데이터로 이미 돌아가는 상태다. **이걸 지우고 새로 짜지 말고, 더미를 진짜로 갈아끼운다.**

지킬 것:
- `Watermark > AppShell > AppShellHeader/AppShellContent/TabBar` 트리는 유지.
  `Watermark`가 `h-dvh` + 중앙정렬 + 하단 `PoweredByKit` 크레딧을 담당한다 —
  빼면 콘텐츠 높이만큼 쪼그라들고 크레딧도 안 뜬다.
- `<Watermark trackSlug={import.meta.env.VITE_M1K_SLUG}>` 줄은 **건드리지 마라.**
  Vite는 `import.meta.env`를 앱 소스에서만 치환한다 — kit 안에서는 못 읽으므로
  이 줄이 유일한 연결 지점이다.
- `AppShellContent` 안은 `<Section>` 블록을 `<Divider spacing="sm" />`로 구분해 쌓는다.
  `<div className="p-4 flex flex-col gap-4">` 같은 손수 만든 wrapper 금지.
- 탭 이름·섹션 내용은 컨셉에 맞게 바꾸되, **비우지 마라.** `{/* TODO */}` 하나만
  남기고 끝내면 실패다. 데이터가 아직 없으면 `EmptyState`를, 숫자가 아직 없으면
  `StatChip value={0}`을 쓴다.
- 테마색은 `themeColor` 상태 하나로 흐른다(`AppShell accent` / `Tab activeColor` /
  `Fab color`). 하드코딩된 색을 새로 뿌리지 마라.

자주 쓰는 kit 컴포넌트: 레이아웃 `AppShell/AppShellHeader/AppShellContent`,
내비 `TabBar/Tab/Fab`, 표시 `Section/SectionHeader/StatChip/Badge/Avatar/EmptyState/
Divider/Skeleton/BarList/ProgressRing/ListRow/ActionCard`, 오버레이 `Dialog/InAppSheet/
ToastProvider·useToast/Tooltip`, 입력 `Button/IconButton/Input/Textarea/Field/Select/
Switch/SegmentedControl/EmojiButton/InlineEdit/ColorPicker`, 모션 `Typewriter/Countdown/Carousel`.

## Step 4 — 확인하고 보고

1. `npm run build` — 타입·번들 통과 확인 (반드시 프로젝트 루트에서)
2. `npm run dev` 띄우고 **첫 화면을 눈으로 본 뒤** 보고한다:
   - 워터마크 배경이 깔렸는가
   - 앱쉘이 화면 중앙에 꽉 찼는가 (모바일 폭에서 가로 스크롤 0)
   - 본문이 비어 있지 않은가
   - 하단에 `powered by @m1kapp/kit` 줄이 뜨는가
   - 트래커를 붙였다면 `www.m1k.app/badge/<slug>.svg` 요청이 나가는가
3. `git init` + 첫 커밋 준비 (커밋은 사용자 확인 후)

추가 컨텍스트: $ARGUMENTS
