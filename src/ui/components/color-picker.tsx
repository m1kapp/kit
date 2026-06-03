import { type CSSProperties } from "react";
import { colors } from "./colors";

export interface ColorPickerProps {
  /** Selected color as a hex string (e.g. "#e2603f") */
  value: string;
  onChange: (hex: string) => void;
  /** Preset swatches. Defaults to the kit `colors` palette. */
  palette?: string[];
  /** Allow picking an arbitrary color via the native color input (default: true) */
  allowCustom?: boolean;
  className?: string;
}

const DEFAULT_PALETTE = Object.values(colors);

function ringStyle(selected: boolean): CSSProperties | undefined {
  return selected
    ? { boxShadow: "0 0 0 2px var(--kit-color-picker-ring, #fff), 0 0 0 4px currentColor" }
    : undefined;
}

/**
 * Color swatch picker — preset circles plus an optional custom color input.
 * The selected swatch gets a ring. Any hex is allowed via the custom input.
 *
 * @example
 * <ColorPicker value={color} onChange={setColor} />
 * <ColorPicker value={color} onChange={setColor} palette={["#e2603f", "#3b82f6"]} />
 */
export function ColorPicker({
  value,
  onChange,
  palette = DEFAULT_PALETTE,
  allowCustom = true,
  className = "",
}: ColorPickerProps) {
  const isPreset = palette.some((c) => c.toLowerCase() === value.toLowerCase());

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {palette.map((c) => {
        const selected = c.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={c}
            className="h-6 w-6 rounded-full transition-all hover:scale-110"
            style={{ backgroundColor: c, color: c, ...ringStyle(selected) }}
          />
        );
      })}
      {allowCustom && (
        <label
          className="relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 transition-all hover:scale-110 dark:border-zinc-600"
          style={!isPreset ? { backgroundColor: value, color: value, borderStyle: "solid", ...ringStyle(true) } : undefined}
          title="커스텀 색상"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          {isPreset && <span className="text-[10px] text-zinc-400">+</span>}
        </label>
      )}
    </div>
  );
}
