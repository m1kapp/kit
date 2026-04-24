import { type ReactNode } from "react";

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

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  dark: "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
  light: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
};

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
};

/**
 * Dark/light button that adapts to dark mode.
 * Renders as `<a>` when `href` is provided, `<button>` otherwise.
 *
 * @example
 * <Button variant="dark" href="https://github.com/m1kapp/ui">GitHub</Button>
 * <Button variant="light" onClick={reset}>다시 시도</Button>
 * <Button variant="dark" shape="pill" full onClick={submit}>시작하기</Button>
 */
export function Button({
  children,
  variant = "dark",
  shape = "rounded",
  full = false,
  className = "",
  ...props
}: ButtonProps) {
  const base = [
    "inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold transition-colors",
    VARIANT_CLASSES[variant],
    SHAPE_CLASSES[shape],
    full ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, target, rel } = props as ButtonAsAnchor;
    return (
      <a href={href} target={target} rel={rel} className={base}>
        {children}
      </a>
    );
  }

  const { onClick, disabled } = props as ButtonAsButton;
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
}
