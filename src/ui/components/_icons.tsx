import { type SVGProps } from "react";

// Shared internal icon set — single source of truth for the check/chevron SVGs
// reused across Stepper, Collapsible, Select, Carousel, etc.

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
  strokeWidth?: number;
}

function Icon({ size = 16, strokeWidth = 2.5, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CheckIcon({ size = 12, strokeWidth = 3.5, ...rest }: IconProps) {
  return <Icon size={size} strokeWidth={strokeWidth} {...rest}><polyline points="20 6 9 17 4 12" /></Icon>;
}

export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}><polyline points="9 18 15 12 9 6" /></Icon>;
}

export function ChevronLeftIcon(props: IconProps) {
  return <Icon {...props}><polyline points="15 18 9 12 15 6" /></Icon>;
}

export function ChevronDownIcon(props: IconProps) {
  return <Icon {...props}><polyline points="6 9 12 15 18 9" /></Icon>;
}
