import React from "react";

type BadgeVariant = "default" | "green" | "red" | "yellow" | "blue" | "purple" | "orange";
type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  green:   "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  red:     "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  yellow:  "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  blue:    "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  purple:  "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  orange:  "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full leading-none ${variants[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
