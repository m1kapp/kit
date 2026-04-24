import { useState, useEffect } from "react";

const CHAR_POP_KEYFRAMES = `
@keyframes m1k-char-pop {
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}`;

let charPopInjected = false;
function injectCharPop() {
  if (charPopInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = CHAR_POP_KEYFRAMES;
  document.head.appendChild(el);
  charPopInjected = true;
}

export interface TypewriterProps {
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
export function Typewriter({
  words,
  color = "currentColor",
  speed = 80,
  deleteSpeed = 30,
  pauseMs = 2200,
  gapMs = 400,
  cursorColor,
  className = "",
}: TypewriterProps) {
  injectCharPop();
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  const currentWord = words[wordIndex] || "";
  const cursor = cursorColor || color;

  const isTyping = !deleting ? charIndex < currentWord.length : charIndex > 0;

  useEffect(() => {
    if (isTyping) { setBlink(true); return; }
    const interval = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(interval);
  }, [isTyping]);

  useEffect(() => {
    if (!deleting && charIndex < currentWord.length) {
      const jitter = Math.random() * speed;
      const pause = currentWord[charIndex - 1] === " " ? speed * 0.4 : 0;
      const timer = setTimeout(() => setCharIndex((c) => c + 1), speed * 0.75 + jitter + pause);
      return () => clearTimeout(timer);
    }
    if (!deleting && charIndex === currentWord.length) {
      const timer = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(timer);
    }
    if (deleting && charIndex > 0) {
      const timer = setTimeout(() => setCharIndex((c) => c - 1), deleteSpeed + Math.random() * deleteSpeed * 0.6);
      return () => clearTimeout(timer);
    }
    if (deleting && charIndex === 0) {
      const timer = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, gapMs);
      return () => clearTimeout(timer);
    }
  }, [charIndex, deleting, currentWord, speed, deleteSpeed, pauseMs, gapMs, words.length]);

  const displayText = currentWord.slice(0, charIndex);
  const lastChar = displayText[displayText.length - 1];
  const rest = displayText.slice(0, -1);

  return (
    <span className={className} style={{ color }}>
      {charIndex > 0 && (
        <>
          {rest}
          <span
            key={`${wordIndex}-${charIndex}`}
            className="inline-block"
            style={{ animation: !deleting ? "m1k-char-pop 0.1s ease-out" : undefined }}
          >
            {lastChar}
          </span>
        </>
      )}
      <span
        className="inline-block w-0.5 h-[1em] ml-px align-middle rounded-full"
        style={{
          backgroundColor: cursor,
          opacity: blink ? 1 : 0,
          transition: "opacity 0.1s",
        }}
      />
    </span>
  );
}
