/**
 * The open .fltr file format, version 0.1.
 *
 * A .fltr file is UTF-8 JSON with the extension `.fltr`. Keys appear in the
 * order declared below.
 */

export const FLTR_FORMAT = "fltr@0.1";
export const FLTR_MEDIA_TYPE = "application/vnd.fltr+json";
export const FLTR_EXTENSION = ".fltr";

/** Dial keys as written in a .fltr file. Each value is an integer from 0 to 10. */
export type FltrDialKey = "solutions" | "local" | "deep_dives" | "outrage" | "hype" | "rumors";

export interface FltrFileV01 {
  format: typeof FLTR_FORMAT;
  /** Display name of the fltr. */
  name: string;
  /** Name of the fltr this one was remixed from, if any. */
  remix_of?: string;
  /** Where stories come from, e.g. "news", "bluesky". */
  sources: string[];
  /** Lowercased dial labels turned up to 7 or more. */
  more: string[];
  /** Lowercased dial labels turned down to 3 or less. */
  less: string[];
  dials: Record<FltrDialKey, number>;
}
