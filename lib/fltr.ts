// Pure tape-deck logic: ranking, remix detection, and the .fltr builder.

import { FLTR_EXTENSION, FLTR_FORMAT, type FltrDialKey, type FltrFileV01 } from "./fltr-spec";
import { BLANK_TAPE, DIALS, type DialValues, type Story, type Tape } from "./sample-data";

export const DIAL_MIN = 0;
export const DIAL_MAX = 10;
export const DIAL_NEUTRAL = 5;

/** The word shown next to a dial, also used as its aria-valuetext. */
export function readout(value: number): string {
  if (value <= 0) return "Off";
  if (value < 5) return "Less";
  if (value === 5) return "Neutral";
  if (value < 10) return "More";
  return "Max";
}

export function isBlank(tape: Tape): boolean {
  return tape.id === BLANK_TAPE.id;
}

/** A tape is remixed when any dial differs from its preset. */
export function isRemixed(tape: Tape, dials: DialValues): boolean {
  return DIALS.some((d) => dials[d.id] !== tape.preset[d.id]);
}

/** Dial values to restore when "Back to original" is pressed. */
export function originalDials(tape: Tape): DialValues {
  return { ...tape.preset };
}

/** The name shown under "Now playing" and written into the .fltr file. */
export function displayName(tape: Tape, dials: DialValues): string {
  const remixed = isRemixed(tape, dials);
  if (isBlank(tape)) return remixed ? "Your new FLTR" : "Blank tape";
  return remixed ? `${tape.name} (remix)` : tape.name;
}

/** The name shown in the deck's "Now playing" heading. A remixed tape keeps its name and gets a badge instead. */
export function nowPlayingName(tape: Tape, dials: DialValues): string {
  return isBlank(tape) ? displayName(tape, dials) : tape.name;
}

export interface RankedStory {
  title: string;
  score: number;
  why: string;
}

export function scoreStory(story: Story, dials: DialValues): { score: number; why: string } {
  let score = 0;
  let best: { label: string; contribution: number } | null = null;
  for (const d of DIALS) {
    const contribution = ((dials[d.id] - DIAL_NEUTRAL) / DIAL_NEUTRAL) * (story[d.id] ?? 0);
    score += contribution;
    if (contribution > 0 && (best === null || contribution > best.contribution)) {
      best = { label: d.label, contribution };
    }
  }
  const why = best
    ? `Here because you turned up ${best.label.toLowerCase()}`
    : "Here because it’s widely covered today";
  return { score, why };
}

/** Rank stories highest score first (ties keep their original order) and return the top `limit`. */
export function rankStories(stories: Story[], dials: DialValues, limit = 3): RankedStory[] {
  return stories
    .map((story, index) => ({ title: story.title, index, ...scoreStory(story, dials) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ title, score, why }) => ({ title, score, why }));
}

export function buildFltrFile(tape: Tape, dials: DialValues): FltrFileV01 {
  const remixed = isRemixed(tape, dials);
  // Spread keeps the key order of the v0.1 format, with remix_of only when present.
  return {
    format: FLTR_FORMAT,
    name: displayName(tape, dials),
    ...(remixed && !isBlank(tape) ? { remix_of: tape.name } : {}),
    sources: [...tape.sources],
    more: DIALS.filter((d) => dials[d.id] >= 7).map((d) => d.label.toLowerCase()),
    less: DIALS.filter((d) => dials[d.id] <= 3).map((d) => d.label.toLowerCase()),
    dials: Object.fromEntries(DIALS.map((d) => [d.key, dials[d.id]])) as Record<FltrDialKey, number>,
  };
}

export function serializeFltrFile(file: FltrFileV01): string {
  return JSON.stringify(file, null, 2);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function fltrFileName(name: string): string {
  return `${slugify(name)}${FLTR_EXTENSION}`;
}
