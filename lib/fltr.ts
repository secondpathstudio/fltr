// Pure demo logic: ranking, ++tags, remix detection, and the .fltr builder.

import { FLTR_EXTENSION, FLTR_FORMAT, type FltrDialKey, type FltrFileV01 } from "./fltr-spec";
import { BLANK_FLTR, DIALS, type DialValues, type Fltr, type Story } from "./sample-data";

export const DIAL_MIN = 0;
export const DIAL_MAX = 10;
export const DIAL_NEUTRAL = 5;

/** The word shown next to a dial, also used as its aria-valuetext. */
export function readout(value: number): string {
  if (value <= 0) return "off";
  if (value < 5) return "less";
  if (value === 5) return "neutral";
  if (value < 10) return "more";
  return "max";
}

/** True for "Start from scratch". */
export function isBlank(fltr: Fltr): boolean {
  return fltr.id === BLANK_FLTR.id;
}

/** A fltr is remixed when any dial differs from its preset. */
export function isRemixed(fltr: Fltr, dials: DialValues): boolean {
  return DIALS.some((d) => dials[d.id] !== fltr.preset[d.id]);
}

/** Dial values to restore when "Back to original" is pressed. */
export function originalDials(fltr: Fltr): DialValues {
  return { ...fltr.preset };
}

/** The `name` written into the .fltr file. Start from scratch is "New fltr", then "Your new fltr" once remixed. */
export function fileName(fltr: Fltr, dials: DialValues): string {
  const remixed = isRemixed(fltr, dials);
  if (isBlank(fltr)) return remixed ? "Your new fltr" : "New fltr";
  return remixed ? `${fltr.name} (remix)` : fltr.name;
}

/**
 * The name shown in the homepage preview ("fltr: <name>"). Start from scratch uses
 * its file name; a remixed preset keeps its name and gets a badge instead.
 */
export function previewName(fltr: Fltr, dials: DialValues): string {
  return isBlank(fltr) ? fileName(fltr, dials) : fltr.name;
}

/** The file name shown under each row of the "Your fltrs" list: the file name at the preset. */
export function listFileName(fltr: Fltr): string {
  return fltrFileName(fileName(fltr, fltr.preset));
}

/** The demo title bar's status: the current file name, prefixed with "editing" once any dial has moved. */
export function statusLine(fltr: Fltr, dials: DialValues): string {
  const file = fltrFileName(fileName(fltr, dials));
  return isRemixed(fltr, dials) ? `editing ${file}` : file;
}

export interface RankedStory {
  title: string;
  score: number;
  /** Lowercased labels of the dials that boosted this story most, largest first (up to 2). */
  boostedBy: string[];
}

export function scoreStory(story: Story, dials: DialValues): { score: number; boostedBy: string[] } {
  let score = 0;
  const positive: { label: string; contribution: number }[] = [];
  for (const d of DIALS) {
    const contribution = ((dials[d.id] - DIAL_NEUTRAL) / DIAL_NEUTRAL) * (story[d.id] ?? 0);
    score += contribution;
    if (contribution > 0) positive.push({ label: d.label.toLowerCase(), contribution });
  }
  // Stable sort: equal contributions keep dial order.
  positive.sort((a, b) => b.contribution - a.contribution);
  return { score, boostedBy: positive.slice(0, 2).map((p) => p.label) };
}

/** Rank stories highest score first (ties keep their original order) and return the top `limit`. */
export function rankStories(stories: Story[], dials: DialValues, limit = 3): RankedStory[] {
  return stories
    .map((story, index) => ({ title: story.title, index, ...scoreStory(story, dials) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ title, score, boostedBy }) => ({ title, score, boostedBy }));
}

/** Visual ++tags, e.g. "++solutions ++local" or "++deep-dives", or "widely covered". */
export function formatTags(boostedBy: string[]): string {
  if (boostedBy.length === 0) return "widely covered";
  return boostedBy.map((label) => `++${label.replace(/\s+/g, "-")}`).join(" ");
}

/** Screen-reader version of the ++tags, e.g. "Boosted by solutions and local", or "Widely covered". */
export function describeTags(boostedBy: string[]): string {
  if (boostedBy.length === 0) return "Widely covered";
  return `Boosted by ${boostedBy.join(" and ")}`;
}

export function buildFltrFile(fltr: Fltr, dials: DialValues): FltrFileV01 {
  const remixed = isRemixed(fltr, dials);
  // Spread keeps the key order of the v0.1 format, with remix_of only when present.
  return {
    format: FLTR_FORMAT,
    name: fileName(fltr, dials),
    ...(remixed && !isBlank(fltr) ? { remix_of: fltr.name } : {}),
    sources: [...fltr.sources],
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
