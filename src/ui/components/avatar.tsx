import React, { useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "rounded";

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  color?: string;
  className?: string;
}

const sizes: Record<AvatarSize, { box: string; text: string; px: number }> = {
  xs: { box: "w-6 h-6",   text: "text-[9px]",  px: 24 },
  sm: { box: "w-8 h-8",   text: "text-[11px]", px: 32 },
  md: { box: "w-10 h-10", text: "text-sm",      px: 40 },
  lg: { box: "w-14 h-14", text: "text-lg",      px: 56 },
  xl: { box: "w-20 h-20", text: "text-2xl",     px: 80 },
};

export function Avatar({
  src,
  fallback,
  size = "md",
  shape = "circle",
  color = "#3f3f46",
  className = "",
}: AvatarProps) {
  const { box, text } = sizes[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={fallback}
        onError={() => setImgError(true)}
        className={`${box} ${radius} object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  const initials = fallback.trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={`${box} ${radius} flex items-center justify-center flex-shrink-0 font-bold select-none ${text} ${className}`}
      style={{ backgroundColor: color, color: "#ffffff" }}
      aria-label={fallback}
    >
      {initials}
    </div>
  );
}
