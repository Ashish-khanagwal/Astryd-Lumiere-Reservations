import { useState } from 'react';
import { isValidHexColor } from '../../../theme/paletteFromColor';

interface HexColorFieldProps {
  label: string;
  hint?: string;
  value?: string;
  defaultColor: string;
  onChange: (hex: string | undefined) => void;
}

/** A single custom hex color override with a native swatch picker, text input, and a reset-to-default action. */
export function HexColorField({ label, hint, value, defaultColor, onChange }: HexColorFieldProps) {
  const [text, setText] = useState(value ?? '');
  const swatchColor = isValidHexColor(text) ? text : defaultColor;

  const commit = (next: string) => {
    setText(next);
    if (next === '') onChange(undefined);
    else if (isValidHexColor(next)) onChange(next);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-on-surface mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={swatchColor}
          onChange={(e) => commit(e.target.value)}
          className="w-10 h-10 rounded-lg border border-outline-variant/40 cursor-pointer bg-transparent p-0 shrink-0"
          aria-label={label}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => commit(e.target.value)}
          placeholder={defaultColor}
          maxLength={7}
          className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-surface outline-none font-mono ${
            text === '' || isValidHexColor(text) ? 'border-outline-variant/40 focus:border-primary' : 'border-red-400'
          }`}
        />
        {text !== '' && (
          <button
            type="button"
            onClick={() => commit('')}
            className="text-xs font-medium text-secondary hover:text-error transition-colors shrink-0 whitespace-nowrap"
          >
            Use default
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-secondary mt-1.5">{hint}</p>}
    </div>
  );
}
