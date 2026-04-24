---
name: m1kapp-seo
description: "프로젝트 SEO 현황을 감사하고 @m1kapp/kit/seo 유틸로 자동 보완합니다."
---

현재 Next.js 프로젝트의 SEO 상태를 점검하고, 빠진 항목을 @m1kapp/kit/seo로 채운다.

## Step 1: SEO 감사

다음 항목들을 병렬로 빠르게 확인한다:

**메타데이터**
- `app/layout.tsx` — metadata export 여부, title/description/og 필드 완성도
- 각 `page.tsx` — generateMetadata 또는 metadata export 여부
- title이 사이트명만 있고 페이지별 구분이 없는지

**크롤링/인덱싱**
- `app/sitemap.ts` 또는 `public/sitemap.xml` 존재 여부
- `app/robots.ts` 또는 `public/robots.txt` 존재 여부
- noIndex가 실수로 켜져 있는지

**소셜 공유**
- OG 이미지 설정 여부 (og:image)
- Twitter Card 설정 여부
- OG 이미지가 정적 파일인지 동적 생성인지

**구조화 데이터**
- JSON-LD script 태그 여부
- 앱 유형에 맞는 schema 적용 여부

---

## Step 2: 결과 리포트

아래 형식으로 현황을 출력한다:

```
SEO 감사 결과

✓ 완료된 항목
  ✓ ...

⚠ 미흡한 항목  
  ⚠ ...

✗ 없는 항목
  ✗ app/sitemap.ts — 없음
  ✗ OG 이미지 — 없음
  ...

SEO 점수: [완료] / [전체] 항목
```

---

## Step 3: 보완 여부 확인

```
위 항목들을 자동으로 보완할까요?
(1) 전체 자동 적용
(2) 항목 선택 후 적용
(3) 리포트만 보기
```

선택에 따라 `@m1kapp/kit/seo`의 유틸로 빠진 항목을 채운다.
기존 코드는 보존하고 필요한 부분만 추가/수정한다.
