// Hardcoded demo data for the tape deck. Dial values run 0–10; story
// attributes run 0–1, and a missing attribute means 0.

export const DIALS = [
  { id: "solutions", label: "Solutions", key: "solutions" },
  { id: "local", label: "Local", key: "local" },
  { id: "deep", label: "Deep dives", key: "deep_dives" },
  { id: "outrage", label: "Outrage", key: "outrage" },
  { id: "hype", label: "Hype", key: "hype" },
  { id: "rumor", label: "Rumors", key: "rumors" },
] as const;

export type Dial = (typeof DIALS)[number];
export type DialId = Dial["id"];
export type DialValues = Record<DialId, number>;

export type Story = { title: string } & Partial<Record<DialId, number>>;

export interface Tape {
  id: string;
  name: string;
  sources: string[];
  preset: DialValues;
  stories: Story[];
}

export const TAPES: Tape[] = [
  {
    id: "climate", name: "Climate without doom", sources: ["news", "bluesky", "youtube"],
    preset: { solutions: 9, local: 6, deep: 6, outrage: 1, hype: 1, rumor: 0 },
    stories: [
      { title: "Cities expand tree planting to cool hot streets", solutions: 1, local: 0.6, deep: 0.3 },
      { title: "How heat pumps work, in plain terms", solutions: 0.7, deep: 0.8 },
      { title: "A farm cooperative tries drought-tolerant crops", solutions: 0.8, local: 0.4, deep: 0.5 },
      { title: "Scientists warn it may already be too late", outrage: 0.6, hype: 0.7 },
      { title: "A celebrity’s private jet sparks online fury", outrage: 1, hype: 0.4 },
      { title: "The quiet math behind grid-scale batteries", deep: 1, solutions: 0.5 },
    ],
  },
  {
    id: "ai", name: "AI signal, no hype", sources: ["news", "papers", "bluesky"],
    preset: { solutions: 5, local: 4, deep: 8, outrage: 2, hype: 0, rumor: 0 },
    stories: [
      { title: "What changed in this week’s open-model releases", deep: 0.6 },
      { title: "A plain guide to recent AI pricing changes", deep: 0.5, solutions: 0.3 },
      { title: "Researchers publish a new benchmark for long tasks", deep: 0.9 },
      { title: "This AI will replace every job by spring, founder claims", hype: 1, outrage: 0.3 },
      { title: "Leaked memo hints at a secret model, sources say", rumor: 1, hype: 0.6 },
      { title: "Local library starts free AI basics classes", local: 1, solutions: 0.6 },
    ],
  },
  {
    id: "f1", name: "F1, no rumors", sources: ["news", "youtube", "podcasts"],
    preset: { solutions: 5, local: 4, deep: 8, outrage: 2, hype: 2, rumor: 0 },
    stories: [
      { title: "Race recap: the strategy calls that decided the podium", deep: 0.8 },
      { title: "Next season’s calendar, as officially announced", deep: 0.3 },
      { title: "Explainer: how tire wear shapes a race", deep: 1 },
      { title: "Is a star driver about to switch teams? Paddock whispers", rumor: 1, hype: 0.5 },
      { title: "Fans furious over a controversial penalty", outrage: 1 },
      { title: "A grassroots karting track opens near the city", local: 1, solutions: 0.3 },
    ],
  },
  {
    id: "local", name: "Local, minus the crime-bait", sources: ["local news", "council feeds"],
    preset: { solutions: 7, local: 10, deep: 6, outrage: 1, hype: 2, rumor: 0 },
    stories: [
      { title: "Council approves a plan to extend library hours", local: 1, solutions: 0.6 },
      { title: "New bike lanes open on the east side next week", local: 1, solutions: 0.5 },
      { title: "This weekend: free museum day and a farmers market", local: 1 },
      { title: "Crime wave? What the numbers actually show", local: 0.6, deep: 0.9 },
      { title: "Neighbors clash online over a new apartment block", local: 0.7, outrage: 1 },
      { title: "Viral post claims a store is closing (it isn’t)", rumor: 1, local: 0.5 },
    ],
  },
];

// Blank tape: all dials at 5, stories = every story from the four tapes above.
export const BLANK_TAPE: Tape = {
  id: "blank", name: "Blank tape", sources: ["news", "bluesky", "youtube", "podcasts"],
  preset: { solutions: 5, local: 5, deep: 5, outrage: 5, hype: 5, rumor: 5 },
  stories: TAPES.flatMap((t) => t.stories),
};

export const ALL_TAPES: Tape[] = [...TAPES, BLANK_TAPE];
export const DEFAULT_TAPE_ID = "climate";
