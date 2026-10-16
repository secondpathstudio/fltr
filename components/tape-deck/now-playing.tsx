import { useLayoutEffect, useRef } from "react";
import type { RankedStory } from "@/lib/fltr";

interface NowPlayingProps {
  name: string;
  showRemixBadge: boolean;
  stories: RankedStory[];
}

export function NowPlaying({ name, showRemixBadge, stories }: NowPlayingProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const previousTops = useRef(new Map<string, number>());
  const order = stories.map((s) => s.title).join("\n");

  // FLIP: when the order changes, slide each item from its old position.
  // Positions are measured relative to the list, so page scroll doesn't matter.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const animate = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const tops = new Map<string, number>();
    for (const el of Array.from(list.children) as HTMLElement[]) {
      const key = el.dataset.title ?? "";
      tops.set(key, el.offsetTop);
      if (!animate || previousTops.current.size === 0) continue;
      const before = previousTops.current.get(key);
      if (before === undefined) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: "ease-out" });
      } else if (before !== el.offsetTop) {
        el.animate(
          [{ transform: `translateY(${before - el.offsetTop}px)` }, { transform: "none" }],
          { duration: 250, easing: "ease-out" },
        );
      }
    }
    previousTops.current = tops;
  }, [order]);

  return (
    <section aria-labelledby="now-playing-heading">
      <p id="now-playing-heading" className="text-base text-muted">
        Now playing
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="font-display text-2xl font-bold text-primary">{name}</h3>
        {showRemixBadge && (
          <span className="rounded-full border-2 border-primary bg-label px-3 py-0.5 text-sm font-bold text-ink">
            Your remix
          </span>
        )}
      </div>
      <ol ref={listRef} className="relative mt-4 border-t-2 border-dotted border-lines">
        {stories.map((story) => (
          <li key={story.title} data-title={story.title} className="border-b-2 border-dotted border-lines bg-deck py-3">
            <p className="text-lg leading-snug font-bold text-ink">{story.title}</p>
            <p className="mt-1 text-[15px] text-muted">{story.why}</p>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {stories[0] ? `Top story: ${stories[0].title}` : ""}
      </p>
    </section>
  );
}
