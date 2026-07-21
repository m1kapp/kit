import { useState, useEffect } from "react";
import { CheckIcon } from "../shared";
import {
  Section, SectionHeader, Divider,
  svgIcon, usePWAInstall, PWAInstallButton, IOSInstallSheet,
} from "@m1kapp/kit";
import { CodeCard } from "../shared";

/* ══════════════════════════════════════════════
   PWA Detail
══════════════════════════════════════════════ */
function InstallDemo({ iconBg, iconText, radius }: { iconBg: string; iconText: string; radius: number }) {
  const { state } = usePWAInstall();
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const iconSrc = svgIcon(iconText || "App", { size: 192, bg: iconBg, radius });

  const stateInfo: Record<typeof state, { badge: string; color: string; desc: string }> = {
    "android-ready": { badge: "Android 준비됨", color: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400", desc: "버튼을 누르면 Chrome 네이티브 설치 다이얼로그가 표시돼요." },
    "ios-safari":    { badge: "iOS Safari 감지됨", color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400", desc: "버튼을 누르면 홈 화면 추가 안내 시트가 열려요." },
    "installed":     { badge: "이미 설치됨", color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400", desc: "현재 standalone 모드로 실행 중이에요." },
    "unsupported":   { badge: "미지원 환경", color: "text-zinc-400 bg-zinc-100 dark:bg-zinc-800", desc: "이 브라우저에서는 설치 버튼이 표시되지 않아요." },
  };
  const { badge, color, desc } = stateInfo[state];

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${color}`}>{badge}</span>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
        <img src={iconSrc} alt="icon" className="w-12 h-12 rounded-xl shadow flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">@m1kapp/kit</p>
          <p className="text-xs text-zinc-400 mt-0.5">kit.m1k.app</p>
        </div>
        <PWAInstallButton appName="@m1kapp/kit" iconSrc={iconSrc} label="설치" installedLabel="설치됨" />
      </div>
      <button
        onClick={() => setIosSheetOpen(true)}
        className="w-full py-2.5 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
      >
        iOS 안내 시트 미리보기 →
      </button>
      <IOSInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} appName="@m1kapp/kit" iconSrc={iconSrc} />
    </div>
  );
}

export function PWADetail({ themeColor }: { themeColor: string }) {
  const [iconText, setIconText] = useState("kit");
  const [iconBg, setIconBg] = useState(themeColor);
  const [radius, setRadius] = useState(0.25);

  useEffect(() => { setIconBg(themeColor); }, [themeColor]);

  const previewSrc = svgIcon(iconText || "·", { size: 192, bg: iconBg, radius });

  return (
    <>
      {/* svgIcon */}
      <Section className="pt-4">
        <SectionHeader>svgIcon() — 아이콘 생성기</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          텍스트로 SVG 아이콘을 생성해요. 이미지 파일이 필요 없어요.
        </p>
        <div className="flex items-center gap-4 mb-3">
          <img src={previewSrc} alt="preview" className="w-20 h-20 rounded-2xl shadow-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">텍스트</label>
              <input type="text" value={iconText} onChange={(e) => setIconText(e.target.value.slice(0, 4))} maxLength={4}
                className="mt-1 w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-sm font-mono text-zinc-800 dark:text-zinc-200 outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2"
                style={{ fontSize: "16px" }} />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">배경색</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={iconBg} onChange={(e) => setIconBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                <code className="text-xs text-zinc-500 font-mono">{iconBg}</code>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">radius — {radius}</label>
              <input type="range" min="0" max="0.5" step="0.05" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} className="w-full mt-1" />
            </div>
          </div>
        </div>
        <CodeCard title="svgIcon()" code={`import { svgIcon } from "@m1kapp/kit";\n\nsvgIcon("${iconText || "App"}", {\n  size: 192,\n  bg: "${iconBg}",\n  radius: ${radius},\n});\n// → "data:image/svg+xml,..."`} />
      </Section>

      <Divider />

      {/* createManifest */}
      <Section>
        <SectionHeader>createManifest() — 웹 앱 매니페스트</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          <code className="font-mono">public/manifest.json</code> 대신 <code className="font-mono">app/manifest.ts</code>에서 코드로 관리해요.
        </p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 mb-3">
          <img src={svgIcon(iconText || "·", { size: 192, bg: iconBg, radius })} alt="192" className="w-10 h-10 rounded-lg" />
          <img src={svgIcon(iconText || "·", { size: 512, bg: iconBg, radius })} alt="512" className="w-14 h-14 rounded-xl" />
          <div className="text-xs text-zinc-400">
            <p>192×192 + 512×512</p>
            <p className="text-zinc-300 dark:text-zinc-600 mt-0.5">자동 생성됨</p>
          </div>
        </div>
        <CodeCard title="app/manifest.ts" code={`import { createManifest } from "@m1kapp/kit";\n\nexport default createManifest({\n  name: "My App",\n  shortName: "App",\n  themeColor: "${iconBg}",\n  icon: { text: "${iconText || "App"}" },\n});`} />
      </Section>

      <Divider />

      {/* mobileViewport */}
      <Section>
        <SectionHeader>mobileViewport — 핀치 줌 차단</SectionHeader>
        <div className="space-y-2 mb-3">
          {[
            { label: "핀치 줌 차단", desc: "CSS touch-action: pan-x pan-y (iOS 10+ 포함)" },
            { label: "인풋 자동 확대 방지", desc: "font-size: max(16px, 1em) 자동 적용" },
            { label: "Android / 구형 iOS", desc: "maximumScale=1, userScalable=false" },
            { label: "Safe Area Inset", desc: "viewportFit=cover — 노치 / Dynamic Island 기기 대응" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <CheckIcon size={14} className="text-zinc-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <CodeCard title="app/layout.tsx" code={`import { mobileViewport } from "@m1kapp/kit";\n\nexport const viewport = mobileViewport;`} />
      </Section>

      <Divider />

      {/* Install button */}
      <Section>
        <SectionHeader>PWAInstallButton — 앱 설치 유도</SectionHeader>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          Android는 네이티브 설치 다이얼로그, iOS는 단계별 안내 시트를 자동으로 띄워요.
        </p>
        <InstallDemo iconBg={iconBg} iconText={iconText} radius={radius} />
        <div className="mt-3 space-y-2">
          <CodeCard title="PWAInstallButton" code={`import { PWAInstallButton } from "@m1kapp/kit";\n\n<PWAInstallButton\n  appName="My App"\n  iconSrc="/icon.png"\n  label="앱으로 설치"\n/>`} />
          <CodeCard title="usePWAInstall (커스텀 UI)" code={`import { usePWAInstall } from "@m1kapp/kit";\n\nconst { state, install } = usePWAInstall();\n// "android-ready" | "ios-safari" | "installed" | "unsupported"`} />
        </div>
      </Section>

      <div className="pb-6" />
    </>
  );
}
