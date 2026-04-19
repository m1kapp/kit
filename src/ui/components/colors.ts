export const colors = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#10b981",
  orange: "#f97316",
  pink: "#ec4899",
  red: "#ef4444",
  yellow: "#eab308",
  cyan: "#06b6d4",
  slate: "#0f172a",
  zinc: "#27272a",
} as const;

export type ColorName = keyof typeof colors;
