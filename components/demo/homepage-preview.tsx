import { useLayoutEffect, useRef } from "react";
import { describeTags, formatTags, type RankedStory } from "@/lib/fltr";

interface HomepagePreviewProps {
  name: string;
  showRemixBadge: boolean;
  stories: RankedStory[];
}

/** The result of the current fltr, in the light "page" colors so it reads as output, not another control. */
export function HomepagePreview({ name, showRemixBadge, stories }: HomepagePreviewProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const previous = useRef(new Map<string, { left: number; top: number }>());
  const order = stories.map((s) => s.title).join("\n");

  // FLIP: when the order changes, slide each story from its old spot.
  // Positions are relative to the list, so page scroll doesn't matter.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const animate = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const next = new Map<string, { left: number; top: number }>();
    for (const el of Array.from(list.children) as HTMLElement[]) {
      const key = el.dataset.title ?? "";
      const now = { left: el.offsetLeft, top: el.offsetTop };
      next.set(key, now);
      if (!animate || previous.current.size === 0) continue;
      const before = previous.current.get(key);
      if (!before) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: "ease-out" });
      } else if (before.left !== now.left || before.top !== now.top) {
        el.animate(
          [{ transform: `translate(${before.left - now.left}px, ${before.top - now.top}px)` }, { transform: "none" }],
          { duration: 250, easing: "ease-out" },
        );
      }
    }
    previous.current = next;
  }, [order]);

  return (
    <section
      aria-labelledby="homepage-heading"
      className="m-[clamp(12px,1.6vw,20px)] rounded-md bg-page p-[clamp(18px,2.5vw,28px)] text-page-fg"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-2 border-page-fg pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 id="homepage-heading" className="text-[clamp(21px,2vw,26px)] leading-tight font-bold">
            Your homepage
          </h3>
          {showRemixBadge && (
            <span className="rounded-[3px] bg-page-fg px-2 py-0.5 font-mono text-[12.5px] text-page">your remix</span>
          )}
        </div>
        <p className="font-mono text-[13px] text-page-muted">fltr: {name}</p>
      </div>
      <ol
        ref={listRef}
        className="relative mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-8 gap-y-6"
      >
        {stories.map((story) => (
          <li key={story.title} data-title={story.title} className="bg-page">
            <p className="text-[20px] leading-[1.3] font-bold">{story.title}</p>
            <p aria-hidden="true" className="tags mt-2 text-[12.5px] text-page-muted">
              {formatTags(story.boostedBy)}
            </p>
            <p className="sr-only">{describeTags(story.boostedBy)}</p>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {stories[0] ? `Top story: ${stories[0].title}` : ""}
      </p>
    </section>
  );
}
