"use client";

import { useState } from "react";
import { InAppSheet } from "./in-app-sheet";

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "자주 쓰는",
    emojis: ["🏠", "🔍", "👤", "⭐", "❤️", "🔥", "✅", "📌", "🎯", "💡", "🚀", "💬", "👍", "🙌", "💪", "🎉", "📢", "🔑", "⚡", "🌟", "🎀", "🧡", "🫶", "🥇"],
  },
  {
    label: "감정",
    emojis: ["😀", "😄", "😆", "😎", "🥹", "😍", "🤩", "😅", "😂", "🥲", "😭", "😤", "🤔", "😇", "🫶", "🤗", "😴", "🤯", "🥳", "😬", "🫠", "🤫", "😶", "🫡"],
  },
  {
    label: "동물",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦉", "🦋", "🐢", "🐬", "🐳"],
  },
  {
    label: "사물",
    emojis: ["📱", "💻", "⌨️", "🖥️", "📷", "🎵", "🎮", "📚", "💰", "🎁", "🔔", "📊", "🗓️", "⚡", "🔧", "💊", "🧪", "🔭", "🎙️", "🖋️", "📦", "🛍️", "💳", "🔐"],
  },
  {
    label: "자연",
    emojis: ["🌈", "🌸", "🌿", "🍀", "🌙", "☀️", "⭐", "🌊", "🍎", "🌺", "❄️", "🌴", "🌵", "🍄", "🌻", "🌍", "⛅", "🌪️", "🌅", "🍁", "🌾", "🪸", "🫧", "☄️"],
  },
  {
    label: "활동",
    emojis: ["🏃", "🧘", "🎨", "🍳", "✈️", "🏕️", "🎤", "🏋️", "🤸", "🧩", "🎭", "🛒", "🚴", "🏊", "⛷️", "🎸", "🎹", "📸", "🧗", "🤿", "🎲", "🏆", "🎯", "🪄"],
  },
];

export interface EmojiButtonProps {
  emoji: string;
  onClick: () => void;
  className?: string;
}

/**
 * Small button displaying the selected emoji.
 * Use it anywhere — tab icons, headers, list items, etc.
 */
export function EmojiButton({ emoji, onClick, className = "" }: EmojiButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all hover:scale-110 active:scale-90 ${className}`}
      title="Pick emoji"
    >
      {emoji}
    </button>
  );
}

export interface EmojiPickerLabels {
  title?: string;
  close?: string;
}

export interface EmojiPickerProps {
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
export function EmojiPicker({ open, onClose, current, onSelect, labels: _labels }: EmojiPickerProps) {
  const l = { title: "이모지", close: "닫기", ..._labels };
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <InAppSheet open={open} onClose={onClose} title={l.title} hideClose>
      {/* Category tabs */}
      <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(i)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === i
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="px-4 pb-3 grid grid-cols-6 gap-2">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((em) => (
          <button
            key={em}
            onClick={() => {
              onSelect(em);
              onClose();
            }}
            aria-label={em}
            className={`h-11 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-90 ${
              current === em
                ? "bg-zinc-900 dark:bg-white"
                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {em}
          </button>
        ))}
      </div>

      {/* Close */}
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {l.close}
        </button>
      </div>
    </InAppSheet>
  );
}
