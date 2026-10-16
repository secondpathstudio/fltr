"use client";

import { useRef, useState } from "react";
import {
  buildFltrFile,
  fltrFileName,
  isBlank,
  isRemixed,
  nowPlayingName,
  originalDials,
  rankStories,
  serializeFltrFile,
} from "@/lib/fltr";
import { ALL_TAPES, DEFAULT_TAPE_ID, type DialId, type DialValues, type Tape } from "@/lib/sample-data";
import { Dials } from "./dials";
import { FltrFile } from "./fltr-file";
import { NowPlaying } from "./now-playing";
import { TapesRow } from "./tapes-row";

const DEFAULT_TAPE = ALL_TAPES.find((t) => t.id === DEFAULT_TAPE_ID) ?? ALL_TAPES[0];

/** The interactive tape deck plus the live .fltr file it writes. Each tape is one FLTR. */
export function TapeDeck() {
  const [tape, setTape] = useState<Tape>(DEFAULT_TAPE);
  const [dials, setDials] = useState<DialValues>(() => originalDials(DEFAULT_TAPE));
  const remixHeadingRef = useRef<HTMLHeadingElement>(null);

  const blank = isBlank(tape);
  const remixed = isRemixed(tape, dials);
  const file = buildFltrFile(tape, dials);

  function selectTape(next: Tape) {
    setTape(next);
    setDials(originalDials(next));
  }

  function setDial(id: DialId, value: number) {
    setDials((prev) => ({ ...prev, [id]: value }));
  }

  function backToOriginal() {
    setDials(originalDials(tape));
    // The button disappears once the dials match, so keep focus in the deck.
    remixHeadingRef.current?.focus();
  }

  return (
    <>
      <section aria-labelledby="deck-heading" className="container-page">
        <h2 id="deck-heading" className="sr-only">
          Tape deck
        </h2>
        <TapesRow tapes={ALL_TAPES} selectedId={tape.id} onSelect={selectTape} />

        <div className="mt-10 grid gap-x-10 gap-y-10 rounded-[22px] border-2 border-primary bg-deck p-[clamp(18px,3vw,36px)] shadow-riso [grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))]">
          <NowPlaying
            name={nowPlayingName(tape, dials)}
            showRemixBadge={remixed && !blank}
            stories={rankStories(tape.stories, dials)}
          />

          <section aria-labelledby="remix-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3
                id="remix-heading"
                ref={remixHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-bold text-primary"
              >
                {blank ? "Record your own" : "Remix this tape"}
              </h3>
              {remixed && (
                <button
                  type="button"
                  onClick={backToOriginal}
                  className="rounded-full border-2 border-primary bg-surface px-4 py-1.5 font-bold text-primary hover:bg-label"
                >
                  Back to original
                </button>
              )}
            </div>
            <p className="mt-2 mb-5 text-base text-muted">
              {blank
                ? "Start from neutral and set each dial. Your new FLTR appears in the .fltr file below."
                : "Moving any dial makes your own remix. The original tape stays as it was."}
            </p>
            <Dials values={dials} onChange={setDial} />
          </section>
        </div>
      </section>

      <FltrFile fileName={fltrFileName(file.name)} contents={serializeFltrFile(file)} />
    </>
  );
}
