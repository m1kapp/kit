import React from "react";

export interface SkeletonProps {
  /** Tailwind classes for width / height (e.g. "h-4 w-3/4") */
  className?: string;
  /** Corner radius shorthand */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const radii = {
  sm:   "rounded-sm",
  md:   "rounded-md",
  lg:   "rounded-lg",
  xl:   "rounded-xl",
  "2xl":"rounded-2xl",
  full: "rounded-full",
} as const;

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
export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 ${radii[rounded]} ${className}`}
      aria-hidden="true"
    />
  );
}
