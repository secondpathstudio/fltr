import { DIAL_MAX, DIAL_MIN, readout } from "@/lib/fltr";
import { DIALS, type DialId, type DialValues } from "@/lib/sample-data";

interface DialsProps {
  values: DialValues;
  onChange: (id: DialId, value: number) => void;
}

export function Dials({ values, onChange }: DialsProps) {
  return (
    <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr))]">
      {DIALS.map((dial) => {
        const inputId = `dial-${dial.id}`;
        const value = values[dial.id];
        const word = readout(value);
        return (
          <li key={dial.id} className="rounded-xl border-2 border-lines bg-surface px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={inputId} className="font-bold text-ink">
                {dial.label}
              </label>
              <span aria-hidden="true" className="text-base text-muted">
                {word}
              </span>
            </div>
            <input
              id={inputId}
              type="range"
              min={DIAL_MIN}
              max={DIAL_MAX}
              step={1}
              value={value}
              aria-valuetext={word}
              onChange={(e) => onChange(dial.id, Number(e.target.value))}
              className="mt-2 w-full cursor-pointer"
            />
          </li>
        );
      })}
    </ul>
  );
}
