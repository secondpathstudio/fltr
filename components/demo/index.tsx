"use client";

import { useRef, useState } from "react";
import {
  buildFltrFile,
  fltrFileName,
  isBlank,
  isRemixed,
  originalDials,
  previewName,
  rankStories,
  serializeFltrFile,
} from "@/lib/fltr";
import { ALL_FLTRS, DEFAULT_FLTR_ID, type DialId, type DialValues, type Fltr } from "@/lib/sample-data";
import { Term } from "../term";
import { Dials } from "./dials";
import { FltrFile } from "./fltr-file";
import { FltrList } from "./fltr-list";
import { HomepagePreview } from "./homepage-preview";

const DEFAULT_FLTR = ALL_FLTRS.find((f) => f.id === DEFAULT_FLTR_ID) ?? ALL_FLTRS[0];

/** The interactive demo plus the live .fltr file it writes. */
export function Demo() {
  const [fltr, setFltr] = useState<Fltr>(DEFAULT_FLTR);
  const [dials, setDials] = useState<DialValues>(() => originalDials(DEFAULT_FLTR));
  const dialsHeadingRef = useRef<HTMLHeadingElement>(null);

  const blank = isBlank(fltr);
  const remixed = isRemixed(fltr, dials);
  const file = buildFltrFile(fltr, dials);

  function select(next: Fltr) {
    setFltr(next);
    setDials(originalDials(next));
  }

  function setDial(id: DialId, value: number) {
    setDials((prev) => ({ ...prev, [id]: value }));
  }

  function backToOriginal() {
    setDials(originalDials(fltr));
    // The button disappears once the dials match, so keep focus nearby.
    dialsHeadingRef.current?.focus();
  }

  return (
    <>
      <section id="demo" aria-labelledby="demo-heading" className="scroll-mt-4 border-t border-line">
        <div className="container-page py-16">
          <h2 id="demo-heading" className="h2-display">
            Try it.
          </h2>
          <p className="mt-4 max-w-[62ch] text-[19px] text-muted">
            Pick a <Term>fltr</Term>, then turn the dials. Your homepage re-sorts as you go, and tells you why each
            story is there.
          </p>

          <div className="mt-8 rounded-md border border-line bg-surface">
            <div className="grid md:grid-cols-2">
              <div className="p-[clamp(14px,2vw,22px)]">
                <h3 className="mb-3 font-mono text-[15px] font-bold">Your fltrs</h3>
                <FltrList fltrs={ALL_FLTRS} selectedId={fltr.id} onSelect={select} />
              </div>

              <div className="border-t border-line p-[clamp(14px,2vw,22px)] md:border-t-0 md:border-l">
                <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-3">
                  <h3 ref={dialsHeadingRef} tabIndex={-1} className="font-mono text-[15px] font-bold">
                    {blank ? "Set your dials" : "Tune this fltr"}
                  </h3>
                  {remixed && (
                    <button
                      type="button"
                      onClick={backToOriginal}
                      className="rounded border border-line bg-transparent px-3 py-1 font-mono text-[13px] text-fg hover:border-fg"
                    >
                      Back to original
                    </button>
                  )}
                </div>
                <Dials values={dials} onChange={setDial} />
                <p className="mt-3 text-[14px] text-muted">
                  {blank ? (
                    "Start from neutral and set each dial. The file below updates as you go."
                  ) : (
                    <>
                      Moving any dial makes it your own <Term>fltr</Term>. The original stays as it was.
                    </>
                  )}
                </p>
              </div>
            </div>

            <HomepagePreview
              name={previewName(fltr, dials)}
              showRemixBadge={remixed && !blank}
              stories={rankStories(fltr.stories, dials)}
            />
          </div>
        </div>
      </section>

      <FltrFile fileName={fltrFileName(file.name)} contents={serializeFltrFile(file)} />
    </>
  );
}
