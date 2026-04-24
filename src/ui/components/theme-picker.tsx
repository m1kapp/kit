import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { colors } from "./colors";
import { useFocusTrap } from "../hooks/use-focus-trap";

// Reads from cookie (set by server) so there's no flash on SSR.
// Falls back to dark mode if no cookie is found.
// Cookie 없으면 light가 기본값 (쿠키가 있으면 그 값에 따름)
const THEME_SCRIPT = `(function(){try{var c=document.cookie.split('; ').find(function(r){return r.startsWith('theme=')});var t=c?c.split('=')[1]:null;if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`;

export { THEME_SCRIPT };

function setCookieTheme(dark: boolean) {
  try {
    document.cookie = `theme=${dark ? "dark" : "light"};path=/;max-age=31536000;SameSite=Lax`;
  } catch {}
}

const isDarkSnapshot = () => document.documentElement.classList.contains("dark");
const isDarkServer = () => false;

function subscribeDark(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function useDarkMode(controlled?: boolean): [boolean, () => void] {
  const synced = useSyncExternalStore(subscribeDark, isDarkSnapshot, isDarkServer);
  const dark = controlled !== undefined ? controlled : synced;

  const toggle = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setCookieTheme(next);
  }, [dark]);

  return [dark, toggle];
}

export interface ThemeButtonProps {
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
export function ThemeButton({ color, dark: darkProp, onClick, className = "" }: ThemeButtonProps) {
  const [dark] = useDarkMode(darkProp);
  const monoColor = dark ? "#000" : "#fff";
  const monoStroke = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
  const iconColor = dark ? "#fff" : "#000";

  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-full transition-all active:scale-90 hover:scale-110 overflow-hidden cursor-pointer ${className}`}
      style={{ boxShadow: color ? `0 2px 10px ${color}55` : undefined }}
      title="Theme"
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {color ? (
          <>
            {/* top-left: mono */}
            <path d="M0 0 L100 0 L0 100 Z" fill={monoColor} />
            {/* bottom-right: theme color */}
            <path d="M100 0 L100 100 L0 100 Z" fill={color} />
            {/* border */}
            <circle cx="50" cy="50" r="49" fill="none" stroke={monoStroke} strokeWidth="2" />
          </>
        ) : (
          <>
            {/* background */}
            <circle cx="50" cy="50" r="50" fill={monoColor} />
            {/* border */}
            <circle cx="50" cy="50" r="49" fill="none" stroke={monoStroke} strokeWidth="2" />
            {dark ? (
              /* sun icon */
              <g fill={iconColor}>
                <circle cx="50" cy="50" r="14" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 50 + Math.cos(rad) * 22;
                  const y1 = 50 + Math.sin(rad) * 22;
                  const x2 = 50 + Math.cos(rad) * 30;
                  const y2 = 50 + Math.sin(rad) * 30;
                  return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={iconColor} strokeWidth="6" strokeLinecap="round" />;
                })}
              </g>
            ) : (
              /* moon icon — crescent via clip */
              <path
                d="M55 22 A28 28 0 1 0 55 78 A18 18 0 1 1 55 22 Z"
                fill={iconColor}
              />
            )}
          </>
        )}
      </svg>
    </button>
  );
}

export interface ThemeDialogLabels {
  title?: string;
  light?: string;
  dark?: string;
  close?: string;
}

export interface ThemeDialogProps {
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
export function ThemeDialog({
  open,
  onClose,
  current,
  onSelect,
  dark: darkProp,
  onDarkToggle,
  palette = colors,
  labels: _labels,
}: ThemeDialogProps) {
  const l = { title: "테마", light: "라이트", dark: "다크", close: "닫기", ..._labels };
  const [dark, toggleDark] = useDarkMode(darkProp);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(visible);

  useEffect(() => {
    const el =
      anchorRef.current?.closest<HTMLElement>(".app-shell-root") ??
      document.querySelector<HTMLElement>(".app-shell-root");
    setTarget(el ?? document.body);
  }, []);

  // Mount → animate in / out
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  function handleDarkToggle() {
    if (onDarkToggle) onDarkToggle();
    else toggleDark();
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted || typeof document === "undefined" || !target) return (
    <span ref={anchorRef} aria-hidden="true" className="hidden" />
  );

  const entries = Object.entries(palette);

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" className="hidden" />
      {createPortal(
    <div className="absolute inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={trapRef}
        className={`relative z-10 w-full max-w-[430px] mb-3 mx-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3">
          <p className="text-sm font-bold text-zinc-900 dark:text-white mb-3">{l.title}</p>

          <div className="flex gap-2 mb-4">
              {[
                { label: l.light, isDark: false },
                { label: l.dark, isDark: true },
              ].map((mode) => {
                const active = dark === mode.isDark;
                return (
                  <button
                    key={mode.label}
                    onClick={() => { if (!active) handleDarkToggle(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl transition-all ${
                      active
                        ? "bg-zinc-900 dark:bg-white ring-2 ring-zinc-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {mode.isDark ? (
                      <svg width="15" height="15" viewBox="-1 -1 26 26" fill={active ? "#18181b" : "#71717a"}>
                        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="-1 -1 26 26" fill={active ? "white" : "#71717a"}>
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={active ? "white" : "#71717a"} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={`text-sm font-semibold ${
                      active
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}>
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>
        </div>

        <div className="px-4 pb-3 grid grid-cols-5 gap-3 justify-items-center">
          {entries.map(([name, value]) => (
            <button
              key={value}
              onClick={() => {
                onSelect(value);
                onClose();
              }}
              aria-label={name}
              className="relative w-11 h-11 rounded-full transition-all hover:scale-110"
              style={{
                backgroundColor: value,
                boxShadow: current === value
                  ? `0 0 0 2px #fff, 0 0 0 4px ${value}`
                  : `0 0 0 1.5px rgba(255,255,255,0.5), 0 2px 8px rgba(255,255,255,0.2)`,
              }}
            >
              {current === value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {l.close}
          </button>
        </div>
      </div>
    </div>,
    target,
  )}
    </>
  );
}
