import { useRef, useState, type CSSProperties } from "react";

export interface InlineEditProps {
  value: string;
  /** Called with the trimmed value on commit (Enter or blur) */
  onChange: (value: string) => void;
  placeholder?: string;
  /** Disable editing — renders as plain text */
  readOnly?: boolean;
  /** Text color (any CSS color), e.g. an entity's color */
  color?: string;
  /** Class applied to both the display and the input (for shared typography) */
  className?: string;
}

/**
 * Tap-to-edit text. Shows the value as text; clicking turns it into an
 * autofocused input that commits on Enter/blur and cancels on Escape.
 *
 * @example
 * <InlineEdit value={name} onChange={rename} placeholder="이름" className="text-lg font-bold" />
 */
export function InlineEdit({
  value,
  onChange,
  placeholder = "",
  readOnly = false,
  color,
  className = "",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  // value at the moment editing started — used to detect a real user change
  const startValue = useRef(value);
  const style: CSSProperties | undefined = color ? { color } : undefined;

  function startEditing() {
    startValue.current = value;
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    const v = draft.trim();
    // Only commit when the user actually edited — avoids clobbering an external
    // update to `value` that landed while the field was focused but untouched.
    if (v && v !== startValue.current) {
      // Advance the baseline so the blur that fires when Enter unmounts the
      // input doesn't run onChange a second time with the same value.
      startValue.current = v;
      onChange(v);
    }
    setEditing(false);
  }

  if (editing && !readOnly) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        placeholder={placeholder}
        className={`min-w-0 border-b border-zinc-300 bg-transparent outline-none dark:border-zinc-600 ${className}`}
        style={style}
      />
    );
  }

  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={startEditing}
      className={`text-left ${readOnly ? "" : "cursor-text"} ${className}`}
      style={style}
    >
      {value || <span className="text-zinc-400 dark:text-zinc-500">{placeholder}</span>}
    </button>
  );
}
