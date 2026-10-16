import { DIAL_MAX, DIAL_MIN, readout } from "@/lib/fltr";
import { DIALS, type DialId, type DialValues } from "@/lib/sample-data";

interface DialsProps {
  values: DialValues;
  onChange: (id: DialId, value: number) => void;
}

export function Dials({ values, onChange }: DialsProps) {
  return (
    <ul>
      {DIALS.map((dial) => {
        const inputId = `dial-${dial.id}`;
        const value = values[dial.id];
        const word = readout(value);
        return (
          <li key={dial.id} className="grid min-h-11 grid-cols-[96px_minmax(0,1fr)_64px] items-center gap-x-3">
            <label htmlFor={inputId} className="text-[15px]">
              {dial.label}
            </label>
            <input
              id={inputId}
              type="range"
              min={DIAL_MIN}
              max={DIAL_MAX}
              step={1}
              value={value}
              aria-valuetext={word}
              onChange={(e) => onChange(dial.id, Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <span aria-hidden="true" className="font-mono text-[13px] text-muted">
              {word}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
