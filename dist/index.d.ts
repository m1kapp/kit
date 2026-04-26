import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React$1 from 'react';
import React__default, { ReactNode, CSSProperties } from 'react';
import { MetadataRoute, Viewport } from 'next';
import { ClassValue } from 'clsx';

type ButtonVariant = "dark" | "light";
type ButtonShape = "rounded" | "pill";
interface ButtonBaseProps {
    children: ReactNode;
    variant?: ButtonVariant;
    shape?: ButtonShape;
    /** Full width */
    full?: boolean;
    className?: string;
}
interface ButtonAsButton extends ButtonBaseProps {
    href?: undefined;
    onClick?: () => void;
    disabled?: boolean;
}
interface ButtonAsAnchor extends ButtonBaseProps {
    href: string;
    target?: string;
    rel?: string;
    onClick?: undefined;
    disabled?: undefined;
}
type ButtonProps = ButtonAsButton | ButtonAsAnchor;
/**
 * Dark/light button that adapts to dark mode.
 * Renders as `<a>` when `href` is provided, `<button>` otherwise.
 *
 * @example
 * <Button variant="dark" href="https://github.com/m1kapp/ui">GitHub</Button>
 * <Button variant="light" onClick={reset}>다시 시도</Button>
 * <Button variant="dark" shape="pill" full onClick={submit}>시작하기</Button>
 */
declare function Button({ children, variant, shape, full, className, ...props }: ButtonProps): react_jsx_runtime.JSX.Element;

interface AppShellProps {
    children: ReactNode;
    className?: string;
    /** Max width of the shell. Default: 430px */
    maxWidth?: number;
    /** Max height of the shell. Default: 932px (iPhone 15 Pro Max) */
    maxHeight?: number;
    style?: CSSProperties;
}
/**
 * Mobile app-like container with rounded corners, shadow, and ring.
 * Centers content and constrains width for a phone-like viewport.
 */
declare function AppShell({ children, className, maxWidth, maxHeight, style, }: AppShellProps): react_jsx_runtime.JSX.Element;
interface AppShellHeaderProps {
    children: ReactNode;
    className?: string;
}
/**
 * Sticky top header with blur backdrop.
 */
declare function AppShellHeader({ children, className }: AppShellHeaderProps): react_jsx_runtime.JSX.Element;
interface AppShellContentProps {
    children: ReactNode;
    className?: string;
}
/**
 * Scrollable main content area.
 */
declare function AppShellContent({ children, className }: AppShellContentProps): react_jsx_runtime.JSX.Element;

interface TabBarProps {
    children: ReactNode;
    className?: string;
}
/**
 * Sticky bottom navigation tab bar.
 */
declare function TabBar({ children, className }: TabBarProps): react_jsx_runtime.JSX.Element;
interface TabProps {
    active: boolean;
    onClick: () => void;
    icon: ReactNode;
    label: string;
    /** Active tab color. Default: current text color */
    activeColor?: string;
}
/**
 * Individual tab button for the TabBar.
 */
declare function Tab({ active, onClick, icon, label, activeColor }: TabProps): react_jsx_runtime.JSX.Element;

interface SectionProps {
    children: ReactNode;
    className?: string;
}
/**
 * Padded section wrapper (px-4).
 */
declare function Section({ children, className }: SectionProps): react_jsx_runtime.JSX.Element;
interface SectionHeaderProps {
    children: ReactNode;
}
/**
 * Small uppercase section title.
 */
declare function SectionHeader({ children }: SectionHeaderProps): react_jsx_runtime.JSX.Element;

/**
 * Horizontal divider line with margin.
 */
declare function Divider({ className }: {
    className?: string;
}): react_jsx_runtime.JSX.Element;

interface StatChipProps {
    label: string;
    value: number;
    className?: string;
}
/**
 * Compact stat display chip with label and number.
 */
declare function StatChip({ label, value, className }: StatChipProps): react_jsx_runtime.JSX.Element;

interface EmptyStateProps {
    message: string;
    icon?: ReactNode;
}
/**
 * Empty state placeholder with icon and message.
 */
declare function EmptyState({ message, icon }: EmptyStateProps): react_jsx_runtime.JSX.Element;

interface WatermarkSponsor {
    /** Service name displayed in the background as clickable text */
    name: string;
    /** URL to navigate to when the sponsor text is clicked */
    url: string;
}
interface WatermarkProps {
    children: ReactNode;
    /** Background fill color. Accepts any CSS color value. Default: "#0f172a" */
    color?: string;
    /**
     * Repeating watermark text shown across the background.
     * Default: "m1k"
     */
    text?: string;
    /** Max width of the center content area in px. Default: 430 */
    maxWidth?: number;
    /**
     * 1k milestone sponsor slot.
     * The sponsor's name is interleaved with the watermark text across the
     * background. Sponsor tiles are clickable and open the sponsor URL.
     *
     * Font size auto-scales based on text length (14-28px).
     *
     * @example
     * <Watermark
     *   color={colors.blue}
     *   sponsor={{ name: "@m1kapp/ui", url: "https://github.com/m1kapp/ui" }}
     * >
     *   <AppShell>...</AppShell>
     * </Watermark>
     */
    sponsor?: WatermarkSponsor;
    /**
     * Background drift animation speed in seconds per cycle.
     * Set to `0` to disable animation (static background).
     * Default: 40
     *
     * @example
     * <Watermark speed={0} />   // static
     * <Watermark speed={20} />  // faster
     * <Watermark speed={60} />  // very slow
     */
    speed?: number;
}
/**
 * Full-screen colored background with repeating animated text watermark pattern.
 *
 * Renders as a single SVG element with a <pattern> — zero extra DOM nodes per tile.
 * Sponsor tiles inside the pattern are clickable and support hover effects.
 */
declare function Watermark({ children, color, text, maxWidth, sponsor, speed, }: WatermarkProps): react_jsx_runtime.JSX.Element;

declare const colors: {
    readonly blue: "#3b82f6";
    readonly purple: "#8b5cf6";
    readonly green: "#10b981";
    readonly orange: "#f97316";
    readonly pink: "#ec4899";
    readonly red: "#ef4444";
    readonly yellow: "#eab308";
    readonly cyan: "#06b6d4";
    readonly slate: "#0f172a";
    readonly zinc: "#27272a";
};
type ColorName = keyof typeof colors;

declare const THEME_SCRIPT = "(function(){try{var c=document.cookie.split('; ').find(function(r){return r.startsWith('theme=')});var t=c?c.split('=')[1]:null;if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()";

interface ThemeButtonProps {
    /** Accent color for the diagonal split. Omit to show moon/sun icon instead. */
    color?: string;
    dark?: boolean;
    onClick: () => void;
    className?: string;
}
/**
 * Circular theme toggle button.
 * - With `color`: split diagonally — half dark/light, half theme color.
 * - Without `color`: moon (light mode) or sun (dark mode) icon.
 */
declare function ThemeButton({ color, dark: darkProp, onClick, className }: ThemeButtonProps): react_jsx_runtime.JSX.Element;
interface ThemeDialogLabels {
    title?: string;
    light?: string;
    dark?: string;
    close?: string;
}
interface ThemeDialogProps {
    open: boolean;
    onClose: () => void;
    current: string;
    onSelect: (color: string) => void;
    dark?: boolean;
    onDarkToggle?: () => void;
    /** Override the color palette. Defaults to built-in colors. */
    palette?: Record<string, string>;
    /** Override default Korean labels for i18n */
    labels?: ThemeDialogLabels;
}
/**
 * Bottom-sheet style color picker dialog.
 * Shows a 5-column grid of color circles with check on the active one.
 */
declare function ThemeDialog({ open, onClose, current, onSelect, dark: darkProp, onDarkToggle, palette, labels: _labels, }: ThemeDialogProps): react_jsx_runtime.JSX.Element;

/**
 * Font presets for @m1kapp/ui.
 * CDN links only — no font files bundled.
 *
 * ## Quick setup (recommended)
 *
 * Add to your `index.html` <head>:
 * ```html
 * <link rel="preconnect" href="https://cdn.jsdelivr.net" />
 * <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
 * ```
 *
 * Add to your global CSS:
 * ```css
 * html {
 *   font-family: "Tossface", "Pretendard Variable", "Pretendard", system-ui, sans-serif;
 * }
 * ```
 *
 * That's it — Tossface handles emojis, Pretendard handles text.
 */
declare const fonts: {
    /**
     * Tossface — Toss emoji font (open source, jsDelivr CDN).
     * Renders all emoji with the Toss design style.
     * Add this to get consistent emoji across platforms.
     */
    readonly tossface: "https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css";
    /**
     * Pretendard — best Korean variable web font (jsDelivr CDN).
     * Recommended for all Korean UI text.
     */
    readonly pretendard: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
    /** Inter — clean Latin sans-serif (Google Fonts) */
    readonly inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap";
};
type FontName = keyof typeof fonts;
/**
 * Recommended font-family stacks.
 *
 * @example
 * // In your global CSS:
 * html { font-family: ${fontFamily.default}; }
 *
 * // Or in JS (e.g. main.tsx):
 * document.documentElement.style.fontFamily = fontFamily.default;
 */
declare const fontFamily: {
    /**
     * Default recommended stack.
     * Tossface for emoji + Pretendard for Korean/Latin text.
     */
    readonly default: "\"Pretendard Variable\", \"Pretendard\", system-ui, -apple-system, sans-serif, \"Tossface\"";
    /** Pretendard only */
    readonly pretendard: "\"Pretendard Variable\", \"Pretendard\", system-ui, sans-serif";
    /** Inter only */
    readonly inter: "\"Inter\", system-ui, sans-serif";
};

interface TypewriterProps {
    /** Words to cycle through */
    words: string[];
    /** Text color */
    color?: string;
    /** Typing speed in ms (base, actual varies ±50%). Default: 80 */
    speed?: number;
    /** Delete speed in ms. Default: 30 */
    deleteSpeed?: number;
    /** Pause after typing completes in ms. Default: 2200 */
    pauseMs?: number;
    /** Pause between words in ms. Default: 400 */
    gapMs?: number;
    /** Cursor color. Defaults to `color` prop */
    cursorColor?: string;
    className?: string;
}
/**
 * Typewriter effect that cycles through words with human-like timing.
 * Features irregular delays, space pauses, char pop animation, and blinking cursor.
 */
declare function Typewriter({ words, color, speed, deleteSpeed, pauseMs, gapMs, cursorColor, className, }: TypewriterProps): react_jsx_runtime.JSX.Element;

interface EmojiButtonProps {
    emoji: string;
    onClick: () => void;
    className?: string;
}
/**
 * Small button displaying the selected emoji.
 * Use it anywhere — tab icons, headers, list items, etc.
 */
declare function EmojiButton({ emoji, onClick, className }: EmojiButtonProps): react_jsx_runtime.JSX.Element;
interface EmojiPickerLabels {
    title?: string;
    close?: string;
}
interface EmojiPickerProps {
    open: boolean;
    onClose: () => void;
    current: string;
    onSelect: (emoji: string) => void;
    /** Override default Korean labels for i18n */
    labels?: EmojiPickerLabels;
}
/**
 * Bottom-sheet emoji picker with categories.
 */
declare function EmojiPicker({ open, onClose, current, onSelect, labels: _labels }: EmojiPickerProps): react_jsx_runtime.JSX.Element;

interface TooltipProps {
    label: string;
    children: ReactNode;
    /** Placement relative to the trigger. Default: "top" */
    placement?: "top" | "bottom";
}
/**
 * Simple tooltip that appears above (or below) the trigger on hover/focus.
 * Renders via portal so it's never clipped by overflow-hidden containers.
 *
 * @example
 * <Tooltip label="복사하기">
 *   <button>복사</button>
 * </Tooltip>
 */
declare function Tooltip({ label, children, placement }: TooltipProps): react_jsx_runtime.JSX.Element;

interface GrassMapData {
    date: string;
    count: number;
}
interface GrassMapLabels {
    firstRecord?: string;
    noRecord?: string;
    today?: string;
    less?: string;
    more?: string;
    first?: string;
}
interface GrassMapProps {
    data: GrassMapData[];
    accent: string;
    isDark?: boolean;
    /** Unit label appended to count in tooltip. e.g. "명", "commits". Default: "" */
    unit?: string;
    /** Override default Korean labels for i18n */
    labels?: GrassMapLabels;
}
declare function GrassMap({ data, accent, isDark, unit, labels: _labels }: GrassMapProps): react_jsx_runtime.JSX.Element;

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "rounded";
interface AvatarProps {
    src?: string;
    fallback: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    color?: string;
    className?: string;
}
declare function Avatar({ src, fallback, size, shape, color, className, }: AvatarProps): react_jsx_runtime.JSX.Element;

type BadgeVariant = "default" | "green" | "red" | "yellow" | "blue" | "purple" | "orange";
type BadgeSize = "sm" | "md";
interface BadgeProps {
    children: React__default.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}
declare function Badge({ children, variant, size, className, }: BadgeProps): react_jsx_runtime.JSX.Element;

interface UseShareOptions {
    url?: string;
    title?: string;
    text?: string;
}
interface UseShareReturn {
    share: (options?: UseShareOptions) => Promise<void>;
    copied: boolean;
    canNativeShare: boolean;
}
declare function useShare(defaults?: UseShareOptions): UseShareReturn;
interface ShareButtonProps {
    url?: string;
    title?: string;
    text?: string;
    label?: string;
    copiedLabel?: string;
    className?: string;
}
declare function ShareButton({ url, title, text, label, copiedLabel, className, }: ShareButtonProps): react_jsx_runtime.JSX.Element;

type ToastVariant = "default" | "success" | "error" | "info";
interface ToastOptions {
    variant?: ToastVariant;
    duration?: number;
}
type ToastFn = (message: string, options?: ToastOptions) => void;
declare function ToastProvider({ children }: {
    children: React__default.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useToast(): ToastFn;

declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void];

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of inactivity.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   if (debouncedQuery) fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 */
declare function useDebounce<T>(value: T, delay: number): T;

interface UseFormSubmitOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (err: Error) => void;
}
/**
 * Submit function type:
 * - When V is `void` (fn takes no arguments) → `submit()` needs no args
 * - Otherwise → `submit(vars: V)` requires the arg
 */
type SubmitFn<V> = V extends void ? () => Promise<void> : (vars: V) => Promise<void>;
interface UseFormSubmitResult<T, V> {
    submit: SubmitFn<V>;
    loading: boolean;
    error: Error | null;
    data: T | undefined;
    reset: () => void;
}
/**
 * Wraps an async submit function with loading / error / data state.
 * Eliminates the try/catch/finally + setState boilerplate from every form.
 *
 * @example
 * // With args
 * const { submit, loading, error } = useFormSubmit(async (url: string) => {
 *   return api.post<Site>("/api/sites", { url });
 * }, {
 *   onSuccess: (site) => router.push(`/${site.slug}`),
 * });
 * <button onClick={() => submit(inputValue)}>등록</button>
 *
 * @example
 * // No args (fire-and-forget style)
 * const { submit: save, loading } = useFormSubmit(
 *   () => api.put("/api/sites/settings", config),
 *   { onSuccess: () => setSaved(true) }
 * );
 * <button onClick={save}>저장</button>
 */
declare function useFormSubmit<T, V = void>(fn: (vars: V) => Promise<T>, options?: UseFormSubmitOptions<T>): UseFormSubmitResult<T, V>;

interface UseInViewOptions {
    /** 0–1, how much of the element must be visible (default: 0) */
    threshold?: number;
    /** Shrink/grow the root's bounding box (default: "0px") */
    rootMargin?: string;
    /** Only trigger once — stops observing after first intersection (default: false) */
    once?: boolean;
}
interface UseInViewResult {
    /** Attach to the element you want to observe */
    ref: (node: Element | null) => void;
    inView: boolean;
}
/**
 * Observe whether an element is inside the viewport.
 * Common uses: infinite scroll trigger, lazy-load images, entrance animations.
 *
 * @example
 * const { ref, inView } = useInView({ threshold: 0.1, once: true });
 *
 * useEffect(() => {
 *   if (inView) fetchNextPage();
 * }, [inView]);
 *
 * <div ref={ref} />
 */
declare function useInView(options?: UseInViewOptions): UseInViewResult;

/**
 * Traps keyboard focus inside a container while active.
 * Tab / Shift+Tab cycle through focusable elements without escaping.
 *
 * @param active — whether the trap is currently engaged
 * @returns ref to attach to the container element
 */
declare function useFocusTrap<T extends HTMLElement = HTMLElement>(active: boolean): React$1.RefObject<T | null>;

interface SkeletonProps {
    /** Tailwind classes for width / height (e.g. "h-4 w-3/4") */
    className?: string;
    /** Corner radius shorthand */
    rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}
/**
 * Animated loading placeholder.
 *
 * @example
 * // Text line
 * <Skeleton className="h-4 w-3/4" />
 *
 * // Card block
 * <Skeleton className="h-32 w-full" rounded="xl" />
 *
 * // Avatar
 * <Skeleton className="h-10 w-10" rounded="full" />
 */
declare function Skeleton({ className, rounded }: SkeletonProps): react_jsx_runtime.JSX.Element;

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    /** Max width of the panel (default: "max-w-sm") */
    size?: "sm" | "md" | "lg";
    children: React__default.ReactNode;
    /** Hide the backdrop click-to-close behaviour */
    persistent?: boolean;
    /** Close button aria-label. Default: "닫기" */
    closeLabel?: string;
    className?: string;
}
declare function Dialog({ open, onClose, title, size, children, persistent, closeLabel, className, }: DialogProps): react_jsx_runtime.JSX.Element;

interface InAppSheetProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    /** true면 시트가 AppShell 전체 높이를 채움 */
    fullHeight?: boolean;
}
declare function InAppSheet({ open, onClose, children, className, fullHeight, }: InAppSheetProps): react_jsx_runtime.JSX.Element;

type PWAInstallState = "android-ready" | "ios-safari" | "installed" | "unsupported";
interface UsePWAInstallReturn {
    state: PWAInstallState;
    /** Android only — triggers the native install dialog */
    install(): Promise<void>;
}
declare function usePWAInstall(): UsePWAInstallReturn;

interface PWAInstallButtonProps {
    /** App name shown in iOS guide sheet */
    appName?: string;
    /** App icon src shown in iOS guide (optional) */
    iconSrc?: string;
    /** Label for the install button. Default: "앱으로 설치" */
    label?: string;
    /** Label shown when already installed. Default: undefined — button hidden */
    installedLabel?: string;
    className?: string;
}
/**
 * PWA install button that handles both Android and iOS.
 *
 * - Android (Chrome): triggers the native install dialog
 * - iOS (Safari): opens a step-by-step "Add to Home Screen" guide sheet
 * - Already installed: hidden by default (show with installedLabel)
 * - Unsupported: hidden
 *
 * Usage:
 *   <PWAInstallButton appName="My App" iconSrc="/icon.png" />
 */
declare function PWAInstallButton({ appName, iconSrc, label, installedLabel, className, }: PWAInstallButtonProps): react_jsx_runtime.JSX.Element | null;
interface IOSInstallSheetProps {
    open: boolean;
    onClose(): void;
    appName: string;
    iconSrc?: string;
}
/**
 * Bottom-sheet guide for iOS "Add to Home Screen".
 * Can also be used standalone if you need custom trigger UI.
 */
declare function IOSInstallSheet({ open, onClose, appName, iconSrc }: IOSInstallSheetProps): react_jsx_runtime.JSX.Element | null;

/**
 * Drop into <head> in your root layout to pre-load kit styles and
 * prevent the JS injection from re-running (eliminates FOUC).
 *
 * Usage:
 *   // app/layout.tsx
 *   import { KitStyles } from "@m1kapp/kit/pwa";
 *   <head>
 *     <KitStyles />
 *   </head>
 */
declare function KitStyles(): React__default.DetailedReactHTMLElement<{
    "data-m1kapp-ui": string;
    dangerouslySetInnerHTML: {
        __html: string;
    };
}, HTMLElement>;

/**
 * Standard mobile viewport config for Next.js.
 * - Disables pinch zoom via maximumScale (Android, older iOS)
 * - Prevents input auto-zoom on iOS via the CSS in @m1kapp/kit (font-size: max(16px, 1em))
 * - touch-action: pan-x pan-y in CSS handles iOS 10+ pinch zoom
 *
 * Usage: export const viewport = mobileViewport;
 */
declare const mobileViewport: Viewport;
/**
 * Generates an SVG icon as a data URI — no image files needed.
 *
 * Usage:
 *   svgIcon("m1k", { size: 192, bg: "#0f172a" })
 *   svgIcon("WP", { size: 512, bg: "#18181b", radius: 0.25 })
 */
declare function svgIcon(text: string, options?: {
    size?: number;
    bg?: string;
    color?: string;
    /** Corner radius as a fraction of size. Default: 0.25 (25%) */
    radius?: number;
    /** Font size as a fraction of size. Default: 0.375 */
    fontSize?: number;
}): string;
/**
 * Generates a Next.js web app manifest function (app/manifest.ts).
 * Icons are auto-generated as inline SVGs — no image files needed.
 *
 * Usage:
 *   // app/manifest.ts
 *   import { createManifest } from "@m1kapp/kit/pwa";
 *   export default createManifest({
 *     name: "m1k",
 *     shortName: "m1k",
 *     themeColor: "#0f172a",
 *     icon: { text: "m1k" },
 *   });
 */
declare function createManifest(options: {
    name: string;
    shortName?: string;
    description?: string;
    startUrl?: string;
    backgroundColor?: string;
    themeColor?: string;
    /** Text-based icon config — generates SVG icons automatically */
    icon?: {
        text: string;
        bg?: string;
        color?: string;
        radius?: number;
    };
}): () => MetadataRoute.Manifest;

declare class ApiError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly body: unknown;
    readonly url?: string | undefined;
    readonly method?: string | undefined;
    constructor(status: number, statusText: string, body: unknown, url?: string | undefined, method?: string | undefined);
}

interface ApiClientOptions {
    /** Default headers merged into every request */
    headers?: Record<string, string>;
    /** Called before every request — mutate or replace the Request */
    onRequest?: (req: Request) => Request | void;
    /** Called on every non-2xx response — includes url and method for debugging */
    onError?: (err: ApiError) => void;
}
type RequestOptions = {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Override default Content-Type (e.g. for FormData uploads) */
    contentType?: string | null;
};
declare function createApiClient(baseUrl: string, defaults?: ApiClientOptions): {
    get: <T>(path: string, opts?: RequestOptions) => Promise<T>;
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
    put: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
    delete: <T>(path: string, opts?: RequestOptions) => Promise<T>;
};
type ApiClient = ReturnType<typeof createApiClient>;

/** Manually invalidate cache entries. Pass a URL to clear one, or nothing to clear all. */
declare function clearFetchCache(url?: string): void;
type FetchStatus = "idle" | "loading" | "success" | "error";
interface UseFetchOptions<T> {
    /** Skip fetching when false (default: true) */
    enabled?: boolean;
    /** Cache duration in ms. 0 = no cache (default: 0) */
    staleTime?: number;
    /** Number of retries on network error (default: 2) */
    retry?: number;
    /** Base delay between retries in ms — doubles each attempt (default: 1000) */
    retryDelay?: number;
    /** Re-fetch when window regains focus (default: true) */
    revalidateOnFocus?: boolean;
    /** Custom fetcher — defaults to fetch() with JSON/text auto-parse */
    fetcher?: (url: string) => Promise<T>;
    onSuccess?: (data: T) => void;
    onError?: (err: Error) => void;
}
interface UseFetchResult<T> {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
    /**
     * Lifecycle status:
     * - `"idle"` — url is null/undefined or `enabled: false`
     * - `"loading"` — fetch in progress
     * - `"success"` — data loaded (note: data may be null if the API returned null)
     * - `"error"` — last fetch failed
     */
    status: FetchStatus;
    /** Manually trigger a refetch (ignores cache) */
    refetch: () => void;
}
declare function useFetch<T>(url: string | null | undefined, options?: UseFetchOptions<T>): UseFetchResult<T>;

interface UsePollingOptions<T> {
    /** Polling interval in ms (default: 5000) */
    interval?: number;
    /** Start polling immediately (default: true) */
    enabled?: boolean;
    /** Pause polling when the tab is hidden (default: true) */
    pauseOnHidden?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (err: Error) => void;
}
interface UsePollingResult<T> {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
    /** Whether polling is currently active */
    isRunning: boolean;
    stop: () => void;
    start: () => void;
    /** Immediately trigger a fetch without waiting for the next interval */
    refetch: () => void;
}
declare function usePolling<T>(fetcher: () => Promise<T>, options?: UsePollingOptions<T>): UsePollingResult<T>;

declare function relativeTime(date: Date | string | number): string;
declare function formatNumber(n: number): string;
declare function formatPrice(amount: number, currency?: string, locale?: string): string;

declare function cn(...inputs: ClassValue[]): string;

export { type ApiClient, type ApiClientOptions, ApiError, AppShell, AppShellContent, type AppShellContentProps, AppShellHeader, type AppShellHeaderProps, type AppShellProps, Avatar, type AvatarProps, Badge, type BadgeProps, Button, type ButtonProps, type ColorName, Dialog, type DialogProps, Divider, EmojiButton, type EmojiButtonProps, EmojiPicker, type EmojiPickerLabels, type EmojiPickerProps, EmptyState, type EmptyStateProps, type FontName, GrassMap, type GrassMapData, type GrassMapLabels, type GrassMapProps, IOSInstallSheet, InAppSheet, type InAppSheetProps, KitStyles, PWAInstallButton, type PWAInstallState, Section, SectionHeader, type SectionHeaderProps, type SectionProps, ShareButton, type ShareButtonProps, Skeleton, type SkeletonProps, StatChip, type StatChipProps, THEME_SCRIPT, Tab, TabBar, type TabBarProps, type TabProps, ThemeButton, type ThemeButtonProps, ThemeDialog, type ThemeDialogLabels, type ThemeDialogProps, type ToastOptions, ToastProvider, type ToastVariant, Tooltip, type TooltipProps, Typewriter, type TypewriterProps, type UseFetchOptions, type UseFetchResult, type UseFormSubmitOptions, type UseFormSubmitResult, type UseInViewOptions, type UseInViewResult, type UsePWAInstallReturn, type UsePollingOptions, type UsePollingResult, type UseShareOptions, type UseShareReturn, Watermark, type WatermarkProps, type WatermarkSponsor, clearFetchCache, cn, colors, createApiClient, createManifest, fontFamily, fonts, formatNumber, formatPrice, mobileViewport, relativeTime, svgIcon, useDebounce, useFetch, useFocusTrap, useFormSubmit, useInView, useLocalStorage, usePWAInstall, usePolling, useShare, useToast };
