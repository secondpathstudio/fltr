import { listFileName } from "@/lib/fltr";
import type { Fltr } from "@/lib/sample-data";

interface FltrListProps {
  fltrs: Fltr[];
  selectedId: string;
  onSelect: (fltr: Fltr) => void;
}

export function FltrList({ fltrs, selectedId, onSelect }: FltrListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {fltrs.map((fltr) => {
        const selected = fltr.id === selectedId;
        return (
          <li key={fltr.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(fltr)}
              className={`flex min-h-14 w-full flex-col justify-center rounded px-3 py-2 text-left ${
                selected ? "bg-hi text-on-hi" : "bg-transparent text-fg hover:bg-bg"
              }`}
            >
              <span className="text-[16px] leading-snug font-bold">{fltr.name}</span>
              <span className="font-mono text-[12.5px] opacity-75">{listFileName(fltr)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
