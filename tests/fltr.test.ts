import { describe, expect, it } from "vitest";
import {
  buildFltrFile,
  displayName,
  fltrFileName,
  isRemixed,
  nowPlayingName,
  originalDials,
  rankStories,
  readout,
  serializeFltrFile,
  slugify,
} from "@/lib/fltr";
import { BLANK_TAPE, TAPES, type DialValues, type Tape } from "@/lib/sample-data";

const tape = (id: string): Tape => {
  const t = [...TAPES, BLANK_TAPE].find((x) => x.id === id);
  if (!t) throw new Error(`no tape ${id}`);
  return t;
};
const climate = tape("climate");

describe("readout", () => {
  it.each([
    [0, "Off"],
    [1, "Less"],
    [4, "Less"],
    [5, "Neutral"],
    [6, "More"],
    [9, "More"],
    [10, "Max"],
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
    expect(first.why).toBe("Here because you turned up outrage");
    expect(second.title).toBe("Scientists warn it may already be too late");
    expect(second.why).toBe("Here because you turned up hype");
  });

  it("explains a story by the dial with the largest positive contribution", () => {
    const ranked = rankStories(climate.stories, climate.preset);
    expect(ranked[0].why).toBe("Here because you turned up solutions");
  });

  it("lowercases multi-word dial labels in the why text", () => {
    const ai = tape("ai");
    const ranked = rankStories(ai.stories, ai.preset);
    expect(ranked[0].title).toBe("Researchers publish a new benchmark for long tasks");
    expect(ranked[0].why).toBe("Here because you turned up deep dives");
  });

  it("falls back to widely covered when no contribution is positive", () => {
    const ranked = rankStories(BLANK_TAPE.stories, BLANK_TAPE.preset);
    expect(ranked.every((s) => s.score === 0)).toBe(true);
    expect(ranked.every((s) => s.why === "Here because it’s widely covered today")).toBe(true);
    // Ties keep their original order.
    expect(ranked.map((s) => s.title)).toEqual(BLANK_TAPE.stories.slice(0, 3).map((s) => s.title));
  });

  it("treats missing story attributes as 0", () => {
    const dials: DialValues = { solutions: 5, local: 5, deep: 5, outrage: 5, hype: 5, rumor: 10 };
    const ranked = rankStories([{ title: "No rumor attribute" }, { title: "Rumor", rumor: 0.5 }], dials, 2);
    expect(ranked.map((s) => [s.title, s.score])).toEqual([
      ["Rumor", 0.5],
      ["No rumor attribute", 0],
    ]);
  });
});

describe("remixing", () => {
  it("is not remixed at the preset", () => {
    for (const t of [...TAPES, BLANK_TAPE]) expect(isRemixed(t, t.preset)).toBe(false);
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
});

describe("naming", () => {
  it("names a remixed tape '<name> (remix)' and keeps its name under Now playing", () => {
    const dials = { ...climate.preset, local: 0 };
    expect(displayName(climate, climate.preset)).toBe("Climate without doom");
    expect(displayName(climate, dials)).toBe("Climate without doom (remix)");
    expect(nowPlayingName(climate, dials)).toBe("Climate without doom");
  });

  it("names the blank tape 'Blank tape', then 'Your new FLTR' once remixed", () => {
    const dials = { ...BLANK_TAPE.preset, solutions: 8 };
    expect(displayName(BLANK_TAPE, BLANK_TAPE.preset)).toBe("Blank tape");
    expect(displayName(BLANK_TAPE, dials)).toBe("Your new FLTR");
    expect(nowPlayingName(BLANK_TAPE, BLANK_TAPE.preset)).toBe("Blank tape");
    expect(nowPlayingName(BLANK_TAPE, dials)).toBe("Your new FLTR");
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

  it("adds remix_of right after name for a remixed tape", () => {
    const file = buildFltrFile(climate, { ...climate.preset, deep: 7 });
    expect(Object.keys(file)).toEqual(["format", "name", "remix_of", "sources", "more", "less", "dials"]);
    expect(file.name).toBe("Climate without doom (remix)");
    expect(file.remix_of).toBe("Climate without doom");
    expect(file.more).toEqual(["solutions", "deep dives"]);
  });

  it("never adds remix_of for the blank tape", () => {
    const blank = buildFltrFile(BLANK_TAPE, BLANK_TAPE.preset);
    const remixed = buildFltrFile(BLANK_TAPE, { ...BLANK_TAPE.preset, outrage: 0 });
    expect(blank).not.toHaveProperty("remix_of");
    expect(blank.name).toBe("Blank tape");
    expect(blank.more).toEqual([]);
    expect(blank.less).toEqual([]);
    expect(remixed).not.toHaveProperty("remix_of");
    expect(remixed.name).toBe("Your new FLTR");
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
    ["Blank tape", "blank-tape.fltr"],
    ["Your new FLTR", "your-new-fltr.fltr"],
    ["AI signal, no hype", "ai-signal-no-hype.fltr"],
    ["Local, minus the crime-bait", "local-minus-the-crime-bait.fltr"],
  ])("%s → %s", (name, file) => {
    expect(fltrFileName(name)).toBe(file);
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --F1, no rumors!! ")).toBe("f1-no-rumors");
  });
});
