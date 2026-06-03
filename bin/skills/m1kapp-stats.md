현재 프로젝트가 @m1kapp/kit을 쓰는 Next.js(또는 Vite/Remix) 앱인지 확인한 뒤, **코드 분석(stats)** 을 켜고 PoweredByKit 패널에 실제 데이터가 뜨게 만든다.

`m1kkit stats`는 소스를 스캔해 "kit이 대신 써준 코드량 / 컴포넌트·훅·유틸 사용률"을 계산하고 `public/kit-stats.json`을 만든다. 이 파일이 있어야 PoweredByKit 시트가 "N줄 필요했을 걸 / X%를 kit이 처리"를 보여준다. 없으면 패널은 "명령어를 실행하세요" 빈 상태만 뜬다.

---

## Step 0: 파악 (사용자에게 보고하지 않음)

- `package.json` — @m1kapp/kit 설치 여부, `scripts.build`/`scripts.dev`, 이미 `m1kkit stats`가 박혀 있는지
- 소스 디렉토리 — App Router는 보통 `app/`이 루트(`src/` 없음). `src/`가 있으면 `--dir=src`, 없으면 `--dir=.`
- 빌드 산출물 경로 — Next는 `public/`이 정적 루트 → `--out=public`. Vite는 `public/`, 정적 호스팅은 배포 루트
- `public/kit-stats.json` 존재 여부 (있으면 이미 1회 생성됨 → 갱신만 하면 됨)
- `PoweredByKit`가 화면에 실제로 렌더되는지 (보통 `Watermark` 푸터 영역)

---

## Step 1: stats 1회 실행

올바른 `--dir`/`--out`으로 한 번 돌려 데이터가 생기는지 확인한다.

```bash
npx m1kkit stats --dir=. --out=public      # App Router(루트가 app/)
# 또는
npx m1kkit stats --dir=src --out=public    # src/ 구조
```

- 성공하면 `public/kit-stats.json`이 생기고 `컴포넌트 N/30 · 절약 X줄` 요약이 출력된다.
- "디렉토리를 못 찾음" 류 에러 → `--dir`을 실제 소스 폴더로 교정해 재시도(App Router에서 `src`를 찾으면 안 됨).

---

## Step 2: 자동 갱신 — build/dev에 끼우기

매번 손으로 돌리지 않도록 `package.json` scripts에 합친다. **앞에 `|| true`를 붙여** stats 실패가 빌드를 막지 않게 한다.

```jsonc
{
  "scripts": {
    "stats": "m1kkit stats --dir=. --out=public",
    "build": "m1kkit stats --dir=. --out=public || true && next build",
    "dev":   "m1kkit stats --dir=. --out=public || true && next dev"
  }
}
```

- `next` 부분은 vite/remix 등 본인 프레임워크 명령으로 바꾼다.
- `--dir`/`--out`은 Step 1에서 통과한 값을 그대로 쓴다.
- 이미 `build`에 다른 prestep이 있으면 덮지 말고 앞에 체이닝만 추가.

---

## Step 3: 패널에서 확인

- `PoweredByKit`(보통 `Watermark`가 자동 포함)을 열어 데이터가 뜨는지 본다.
- **데이터가 이미 있으면** 패널 하단에 `갱신하려면 npx m1kkit stats` 안내가 보인다 — 빈 상태(명령어 실행 안내)는 더 이상 안 나온다.
- 컴포넌트 사용률이 낮으면(예: 7/30) 더 쓸 만한 kit 컴포넌트를 권하고, 채택 후 stats를 **다시 돌려** 수치를 갱신한다.

---

## Step 4: 커밋

- `public/kit-stats.json`은 **커밋한다**(배포 환경에서 패널이 즉시 뜨도록). 빌드에서 자동 생성되더라도, 정적 호스팅·프리뷰에서 누락되면 빈 상태가 보이므로 체크인해 두는 편이 안전하다.

---

## 주의

- stats는 **소스 라인 수 기반 추정**이다. 정확한 회계가 아니라 "kit이 이만큼 덜 짜게 해줬다"는 감을 주는 용도.
- `--dir`을 잘못 잡으면(빈 폴더) 절약량이 0으로 나온다 — 항상 실제 소스 폴더를 가리킬 것.
- `public/`이 아닌 곳에 내보내면 런타임에서 `/kit-stats.json`을 못 불러온다(404 → 빈 상태). 정적 루트로 내보낼 것.
