import { describe, expect, it } from "vitest";
import {
  buildFltrFile,
  describeTags,
  fileName,
  fltrFileName,
  formatTags,
  isRemixed,
  listFileName,
  originalDials,
  previewName,
  rankStories,
  readout,
  serializeFltrFile,
  slugify,
  statusLine,
} from "@/lib/fltr";
import { ALL_FLTRS, BLANK_FLTR, FLTRS, type DialValues, type Fltr } from "@/lib/sample-data";

const fltr = (id: string): Fltr => {
  const f = ALL_FLTRS.find((x) => x.id === id);
  if (!f) throw new Error(`no fltr ${id}`);
  return f;
};
const climate = fltr("climate");

describe("readout", () => {
  it.each([
    [0, "off"],
    [1, "less"],
    [4, "less"],
    [5, "neutral"],
    [6, "more"],
    [9, "more"],
    [10, "max"],
  ])("%i → %s", (value, word) => {
    expect(readout(value)).toBe(word);
  });
});

describe("rankStories", () => {
  it("ranks the climate preset highest score first and keeps the top 3", () => {
    const ranked = rankStories(climate.stories, climate.preset);
    expect(ranked.map((s) => s.title)).toEqual([
      "Cities expand tree planting to cool hot streets",
      "A farm cooperative tries drought-tolerant crops",
      "How heat pumps work, in plain terms",
    ]);
    expect(ranked[0].score).toBeCloseTo(0.98);
    expect(ranked[1].score).toBeCloseTo(0.82);
    expect(ranked[2].score).toBeCloseTo(0.72);
  });

  it("re-ranks when a dial moves", () => {
    const dials: DialValues = { ...climate.preset, outrage: 10, hype: 10, solutions: 5 };
    const [first, second] = rankStories(climate.stories, dials);
    expect(first.title).toBe("A celebrity’s private jet sparks online fury");
    expect(second.title).toBe("Scientists warn it may already be too late");
  });

  it("treats missing story attributes as 0", () => {
    const dials: DialValues = { solutions: 5, local: 5, deep: 5, outrage: 5, hype: 5, rumor: 10 };
    const ranked = rankStories([{ title: "No rumor attribute" }, { title: "Rumor", rumor: 0.5 }], dials, 2);
    expect(ranked.map((s) => [s.title, s.score])).toEqual([
      ["Rumor", 0.5],
      ["No rumor attribute", 0],
    ]);
  });

  it("keeps the original order for ties", () => {
    const ranked = rankStories(BLANK_FLTR.stories, BLANK_FLTR.preset);
    expect(ranked.every((s) => s.score === 0)).toBe(true);
    expect(ranked.map((s) => s.title)).toEqual(BLANK_FLTR.stories.slice(0, 3).map((s) => s.title));
  });
});

describe("++tags", () => {
  it("lists up to two positive dials, largest contribution first", () => {
    const ranked = rankStories(climate.stories, climate.preset);
    expect(ranked.map((s) => formatTags(s.boostedBy))).toEqual([
      "++solutions ++local",
      "++solutions ++deep-dives",
      "++solutions ++deep-dives",
    ]);
  });

  it("hyphenates multi-word labels", () => {
    const ai = fltr("ai");
    const [top] = rankStories(ai.stories, ai.preset);
    expect(top.title).toBe("Researchers publish a new benchmark for long tasks");
    expect(formatTags(top.boostedBy)).toBe("++deep-dives");
  });

  it("caps at two tags", () => {
    const dials: DialValues = { solutions: 10, local: 10, deep: 10, outrage: 5, hype: 5, rumor: 5 };
    const [top] = rankStories(climate.stories, dials);
    expect(top.boostedBy).toHaveLength(2);
  });

  it('says "widely covered" when no contribution is positive', () => {
    const ranked = rankStories(BLANK_FLTR.stories, BLANK_FLTR.preset);
    expect(ranked.every((s) => formatTags(s.boostedBy) === "widely covered")).toBe(true);
    // Negative-only contributions don't count either.
    const [story] = rankStories([{ title: "Hype only", hype: 1 }], { ...BLANK_FLTR.preset, hype: 0 }, 1);
    expect(formatTags(story.boostedBy)).toBe("widely covered");
  });

  it("has a screen-reader version", () => {
    expect(describeTags(["solutions", "local"])).toBe("Boosted by solutions and local");
    expect(describeTags(["deep dives"])).toBe("Boosted by deep dives");
    expect(describeTags([])).toBe("Widely covered");
  });
});

describe("remixing", () => {
  it("is not remixed at the preset", () => {
    for (const f of ALL_FLTRS) expect(isRemixed(f, f.preset)).toBe(false);
  });

  it("is remixed when any dial differs from the preset", () => {
    expect(isRemixed(climate, { ...climate.preset, rumor: 1 })).toBe(true);
  });

  it("Back to original restores the preset and clears the remix", () => {
    const remixed: DialValues = { ...climate.preset, local: 10, hype: 7 };
    const restored = originalDials(climate);
    expect(restored).toEqual(climate.preset);
    expect(restored).not.toBe(climate.preset);
    expect(isRemixed(climate, remixed)).toBe(true);
    expect(isRemixed(climate, restored)).toBe(false);
  });

  it("switches the status line from playing to editing", () => {
    expect(statusLine(climate, climate.preset)).toBe("playing climate-without-doom.fltr");
    expect(statusLine(climate, { ...climate.preset, local: 0 })).toBe("editing climate-without-doom-remix.fltr");
  });
});

describe("naming", () => {
  it("keeps a remixed preset's name in the preview and adds (remix) in the file", () => {
    const dials = { ...climate.preset, local: 0 };
    expect(previewName(climate, dials)).toBe("Climate without doom");
    expect(fileName(climate, climate.preset)).toBe("Climate without doom");
    expect(fileName(climate, dials)).toBe("Climate without doom (remix)");
  });

  it("names Start from scratch Blank fltr / New fltr, then Your new fltr once remixed", () => {
    const dials = { ...BLANK_FLTR.preset, solutions: 8 };
    expect(BLANK_FLTR.name).toBe("Start from scratch");
    expect(previewName(BLANK_FLTR, BLANK_FLTR.preset)).toBe("Blank fltr");
    expect(previewName(BLANK_FLTR, dials)).toBe("Your new fltr");
    expect(fileName(BLANK_FLTR, BLANK_FLTR.preset)).toBe("New fltr");
    expect(fileName(BLANK_FLTR, dials)).toBe("Your new fltr");
    expect(statusLine(BLANK_FLTR, BLANK_FLTR.preset)).toBe("playing new-fltr.fltr");
    expect(statusLine(BLANK_FLTR, dials)).toBe("editing your-new-fltr.fltr");
  });

  it("shows each list row's file name, with new.fltr for Start from scratch", () => {
    expect(ALL_FLTRS.map(listFileName)).toEqual([
      "climate-without-doom.fltr",
      "ai-signal-no-hype.fltr",
      "f1-no-rumors.fltr",
      "local-minus-the-crime-bait.fltr",
      "new.fltr",
    ]);
    expect(ALL_FLTRS.slice(0, 4)).toEqual(FLTRS);
  });
});

describe(".fltr output", () => {
  it("matches the spec example for the climate preset, in key order", () => {
    const file = buildFltrFile(climate, climate.preset);
    expect(serializeFltrFile(file)).toBe(
      JSON.stringify(
        {
          format: "fltr@0.1",
          name: "Climate without doom",
          sources: ["news", "bluesky", "youtube"],
          more: ["solutions"],
          less: ["outrage", "hype", "rumors"],
          dials: { solutions: 9, local: 6, deep_dives: 6, outrage: 1, hype: 1, rumors: 0 },
        },
        null,
        2,
      ),
    );
  });

  it("adds remix_of right after name for a remixed preset", () => {
    const file = buildFltrFile(climate, { ...climate.preset, deep: 7 });
    expect(Object.keys(file)).toEqual(["format", "name", "remix_of", "sources", "more", "less", "dials"]);
    expect(file.name).toBe("Climate without doom (remix)");
    expect(file.remix_of).toBe("Climate without doom");
    expect(file.more).toEqual(["solutions", "deep dives"]);
  });

  it("never adds remix_of when starting from scratch", () => {
    const blank = buildFltrFile(BLANK_FLTR, BLANK_FLTR.preset);
    const remixed = buildFltrFile(BLANK_FLTR, { ...BLANK_FLTR.preset, outrage: 0 });
    expect(blank).not.toHaveProperty("remix_of");
    expect(blank.name).toBe("New fltr");
    expect(blank.more).toEqual([]);
    expect(blank.less).toEqual([]);
    expect(remixed).not.toHaveProperty("remix_of");
    expect(remixed.name).toBe("Your new fltr");
    expect(remixed.less).toEqual(["outrage"]);
  });

  it("uses boundary values 7 and 3 for more and less", () => {
    const dials: DialValues = { solutions: 7, local: 6, deep: 4, outrage: 3, hype: 10, rumor: 0 };
    const file = buildFltrFile(climate, dials);
    expect(file.more).toEqual(["solutions", "hype"]);
    expect(file.less).toEqual(["outrage", "rumors"]);
  });
});

describe("file names", () => {
  it.each([
    ["Climate without doom", "climate-without-doom.fltr"],
    ["Climate without doom (remix)", "climate-without-doom-remix.fltr"],
    ["New fltr", "new-fltr.fltr"],
    ["Your new fltr", "your-new-fltr.fltr"],
    ["AI signal, no hype", "ai-signal-no-hype.fltr"],
    ["Local, minus the crime-bait", "local-minus-the-crime-bait.fltr"],
  ])("%s → %s", (name, file) => {
    expect(fltrFileName(name)).toBe(file);
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --F1, no rumors!! ")).toBe("f1-no-rumors");
  });
});
