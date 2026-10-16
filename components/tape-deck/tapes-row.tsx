import { isBlank } from "@/lib/fltr";
import type { Tape } from "@/lib/sample-data";

interface TapesRowProps {
  tapes: Tape[];
  selectedId: string;
  onSelect: (tape: Tape) => void;
}

export function TapesRow({ tapes, selectedId, onSelect }: TapesRowProps) {
  return (
    <div role="group" aria-label="Tapes" className="tapes-row">
      {tapes.map((tape) => (
        <button
          key={tape.id}
          type="button"
          aria-pressed={tape.id === selectedId}
          onClick={() => onSelect(tape)}
          className={isBlank(tape) ? "tape tape-blank" : "tape"}
        >
          <span className="tape-label">{tape.name}</span>
          <span className="tape-window" aria-hidden="true">
            <span className="tape-reel" />
            <span className="tape-strip" />
            <span className="tape-reel" />
          </span>
        </button>
      ))}
    </div>
  );
}
