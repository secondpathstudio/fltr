# fltr landing page: build spec (v2, Terminal design)

You're building the first public piece of **fltr** (fltr.world): a one-page landing site with an interactive demo and an email waitlist powered by **Resend**. This file is the complete brief.

> **Updating an existing prototype?** An earlier version of this spec described a colorful "tape deck" design, and the codebase may already implement it. Treat **this file as the source of truth** and follow section 12 to migrate. Keep the Resend waitlist backend, tokens, tests and environment setup unless this spec says otherwise.

Read the whole file before writing code, then work through the acceptance criteria in section 13.

---

## 1. Context

fltr is a homepage for the internet where **you choose the algorithm**. Each algorithm is called a **fltr**: a small, portable rule set. You can pick one, tune it with a few dials, or build your own, and every fltr saves as a plain **.fltr** file in an open format.

The landing page must:

1. Make "I want to control my own algorithm" click in five seconds for non-technical visitors, through a working demo rather than a wall of text.
2. Collect waitlist emails with double opt-in, using Resend.
3. Live the manifesto: no ads, no third-party trackers, accessible, fast.

### Terminology (use consistently in copy and code)
- **The name is always lowercase.** **fltr** is both the project and an algorithm. The plural is **fltrs**; write "a fltr". This holds at the start of a sentence too ("fltr is paid for by…").
- **.fltr** is the file format and extension. **fltr.world** is the site.
- **Everything else uses normal sentence case.** Never set whole headlines or sentences in lowercase.
- **In running sans-serif text, set the name in the monospace face** at about 0.94em, using a small `<Term>` component, e.g. "Pick a <Term>fltr</Term>". This keeps "fltr" from reading as a typo for "filter". Text already set in monospace (headings, UI labels, code) doesn't need it.
- Page titles, email subjects and the email "From" name also use lowercase "fltr".
- Never use "Filter" or "filter" in UI copy. Don't use cassette or tape language anywhere.

---

## 2. Scope

**In scope**
- A single landing page at `/`.
- An interactive demo running entirely client-side with hardcoded sample data: a fltr list, dials, a homepage preview and a live .fltr file.
- A waitlist signup with double opt-in: a confirmation email, a confirm page, and the contact saved in Resend.
- A confirm-result page at `/confirm`.
- A `/privacy` page using the copy in section 6.8.
- SEO basics: title, description, Open Graph image, favicon.
- Deployed to Vercel on `fltr.world`.

**Out of scope for now:** user accounts, a real content pipeline, saving fltrs, payments, analytics dashboards, any CMS, a light theme (it's a token swap later).

---

## 3. Stack

Use these. Ask before adding other dependencies.

| Concern | Choice |
| --- | --- |
| Framework | Next.js, latest stable, App Router, TypeScript in strict mode |
| Styling | Tailwind CSS v4, with all colors defined once as CSS variables (section 4) |
| Fonts | `next/font/google`: **IBM Plex Mono** (400, 500, 700, plus 400 italic) and **IBM Plex Sans** (400, 500, 700) |
| Email | `resend` Node SDK + `@react-email/components` for templates |
| Validation | `zod` |
| Tests | Vitest for units; Playwright for one end-to-end signup test |
| Package manager | pnpm |
| Hosting | Vercel |
| Analytics | None at launch. If added later: cookieless only (e.g. Vercel Web Analytics), behind an env flag |

---

## 4. Design tokens: the color "globals"

The page is **grayscale only**. **Every color comes from these 10 CSS variables, defined once in `app/globals.css`.** No hex values anywhere else: no inline styles, no Tailwind arbitrary values like `bg-[#1B1B1B]`. Changing a value here must retheme the whole site.

```css
:root {
  --fltr-background:      #1B1B1B; /* page background, code block background */
  --fltr-surface:         #222222; /* demo panel, inputs, file-name bar */
  --fltr-lines:           #3A3A3A; /* all borders, dividers, dashed rules */
  --fltr-text:            #E8E8E8; /* primary text, focus ring */
  --fltr-muted-text:      #A3A3A3; /* secondary text, nav links, text-art logo */
  --fltr-highlight:       #E8E8E8; /* reversed selection, primary buttons, sliders, badges */
  --fltr-on-highlight:    #1B1B1B; /* text on highlight */
  --fltr-page-background: #EFEFEF; /* the "Your homepage" preview block */
  --fltr-page-text:       #161616; /* text inside the homepage block */
  --fltr-page-muted-text: #555555; /* secondary text and ++tags inside the homepage block */
}

@theme inline {
  --color-bg: var(--fltr-background);
  --color-surface: var(--fltr-surface);
  --color-line: var(--fltr-lines);
  --color-fg: var(--fltr-text);
  --color-muted: var(--fltr-muted-text);
  --color-hi: var(--fltr-highlight);
  --color-on-hi: var(--fltr-on-highlight);
  --color-page: var(--fltr-page-background);
  --color-page-fg: var(--fltr-page-text);
  --color-page-muted: var(--fltr-page-muted-text);
}
```

**Signature look: a subtle retro terminal that anyone can read.**
- 1px borders in `--fltr-lines`. Radii of 3–6px. No shadows, no gradients, no glow.
- **Selection is reversed colors:** `--fltr-highlight` background with `--fltr-on-highlight` text, like old terminal text. Use this for the selected fltr, primary buttons and the "your remix" badge.
- A small text-art logo in the hero (section 6.2), in `--fltr-muted-text`.
- **One** piece of ambient motion: a blinking block cursor after the H1 (1.1s, `steps(1)`). It's turned off under `prefers-reduced-motion`. Nothing else animates on its own.
- Focus rings: `outline: 2px dashed var(--fltr-text); outline-offset: 3px`.

---

## 5. Typography

- **IBM Plex Mono:** the wordmark, all headings (H1–H3), nav links, buttons, form inputs, UI labels, the demo's title bar, file names, the ++tags and the code block.
- **IBM Plex Sans:** body paragraphs, story titles, dial labels, principle descriptions and form labels.
- **Scale:**
  - H1 `clamp(38px, 5.6vw, 72px)`, weight 700, line-height 1.04, letter-spacing -0.03em.
  - H2 `clamp(26px, 3vw, 38px)`, weight 700, letter-spacing -0.02em.
  - Body 17–21px, line-height 1.6.
  - UI labels 13px.
  - Code 14px, line-height 1.65.
- Keep line length under ~75 characters. Left-align everything; don't center text.
- No all-caps text anywhere.

---

## 6. Page structure and exact copy

Content container: max-width 1160px, centered, horizontal padding `clamp(16px, 4vw, 48px)`. Major sections are separated by a 1px `--fltr-lines` top border. All layouts use flex/grid with wrapping, so they stack cleanly at 360px wide.

### 6.1 Header
- A bottom border.
- Left: wordmark **fltr** (Plex Mono 700, 20px, `--fltr-text`), linking to `#join`.
- Right, in Plex Mono 15px:
  - "Try it" linking to `#demo` (muted).
  - "The .fltr format" linking to `#format` (muted).
  - A "Join the waitlist" link styled as a button: 1px `--fltr-text` border, 4px radius, linking to `#join`.

### 6.2 Hero (max-width ~760px)
1. **Text-art logo** in a `<pre aria-hidden="true">` (Plex Mono 14px, line-height 1.15, muted). Use exactly this:
   ```
     __   _   _
    / _| | | | |_   _ _
   |  _| | | |  _| | '_|
   |_|   |_|  \__| |_|
   ```
2. **H1:** Choose your own algorithm. Follow it with the blinking block cursor (a `<span aria-hidden>`, `--fltr-text` fill, about 0.5em × 0.82em).
3. **Paragraph (muted):** Every app decides what you see. <Term>fltr</Term> lets you decide instead. Pick a <Term>fltr</Term>, tune it with a few dials or in plain words, and your homepage follows your rules, not an advertiser's.
4. **Waitlist form** (component spec in 6.6).

### 6.3 Demo (`id="demo"`)
- **H2:** Try it.
- **Paragraph (muted):** Pick a <Term>fltr</Term>, then turn the dials. Your homepage re-sorts as you go, and tells you why each story is there.
- **The demo panel** has a 1px border, 6px radius and `--fltr-surface` background, and contains three parts (behavior in section 7):
  1. **Title bar:** a bottom border, Plex Mono 13px, muted. Left: `fltr.world/demo`. Right: the status line, `playing <file name>` or `editing <file name>` once any dial has moved.
  2. **Controls row:** two columns, wrapping to one on narrow screens and separated by 1px `--fltr-lines`. Left is the **fltr list** (heading "Your fltrs"); right is the **dials** (heading "Tune this fltr", or "Set your dials" when starting from scratch).
  3. **Homepage preview:** a full-width block under the controls, inset 12–20px, using the **page colors** (light gray, dark text) so it reads as the result, not another control.

### 6.4 The .fltr format (`id="format"`)
- Two columns that wrap.
- **Left:**
  - **H2:** A fltr is just a file.
  - **Paragraph (muted):** No black box. The whole algorithm is a short, readable <Term>.fltr</Term> file. Share it with a friend, build on publicly shared <Term>fltrs</Term>, or take yours to any app that reads the format.
  - **Small paragraph (muted), with an arrow pointing at the file panel:** "This example updates as you change the <Term>fltr</Term> above."
    - The arrow is a decorative `aria-hidden` glyph in Plex Mono, about 18px, in `--fltr-text`.
    - Wide screens, with the file panel beside the text: a right arrow (→) **after** the text.
    - Narrow screens, once the columns stack: a down arrow (↓) **before** the text.
- **Right:** a file panel with a 1px border and 6px radius:
  - **File-name bar:** `--fltr-surface`, Plex Mono 13px, muted, showing the current file name (section 7.6).
  - **Code block:** `--fltr-background`, `--fltr-text`, Plex Mono 14px, horizontal scroll on overflow, `aria-label="The current fltr as a .fltr file"`.

### 6.5 Principles
- A two-column definition list (`<dl>`), max-width ~860px. Terms are Plex Mono 16px bold; descriptions are Plex Sans 17px muted. Each row has a 1px bottom border.
- These aren't a sequence, so don't number them.

| Term | Description |
| --- | --- |
| No ads, ever | <Term>fltr</Term> is paid for by the people who use it, not by advertisers. |
| Open source | Read the code that ranks your homepage. Run it yourself if you like. |
| Yours to keep | <Term>fltrs</Term> are plain <Term>.fltr</Term> files. Take yours to any app that reads them. |
| Nothing hidden | Every story shows its sources and why it's on your page. |

### 6.6 Join (`id="join"`), and the shared waitlist form
- **H2:** Get early access.
- **The form** (used in the hero and here; extract it as one component):
  - A visible label "Email address" (Plex Sans 15px, muted).
  - An email input: Plex Mono 16px, 50px tall, `--fltr-surface` background, 1px lines border, placeholder `you@example.com`, `autocomplete="email"`.
  - A **Join the waitlist** button: Plex Mono 16px bold, reversed colors (highlight background, on-highlight text), 4px radius.
  - **Note (muted, 14px):** Open source. No ads, ever. We'll only email you about the launch. In the Join section only, end it with a link: "How we handle your email" → `/privacy`.
  - **Success state**, replacing the inputs, in `role="status"` with a 1px border and Plex Mono: "Almost there. Check your inbox and click the link to confirm your spot."
  - **Error states,** shown inline under the field and linked via `aria-describedby`:
    - "That doesn't look like an email address. Check for typos and try again."
    - "Something went wrong on our side. Try again in a minute."

### 6.7 Footer
- A top border, in Plex Mono 14px.
- Left: "fltr.world" (`--fltr-text`).
- Right: "Built in the open." and a "Privacy" link to `/privacy` (muted).

### 6.8 Privacy page (`/privacy`)

Use this copy verbatim. Keep the `[BRACKETED]` placeholders visible until I fill them in. Use the same header, footer and fonts as the landing page, with a single text column at a max width of ~68ch: headings in Plex Mono, body in Plex Sans.

> **Privacy**
>
> Last updated: [LAUNCH DATE]
>
> fltr.world collects as little as possible. Here's everything we do with your information.
>
> **What we collect**
> If you join the waitlist, we store your email address and the date you confirmed. That's it. We don't ask for your name, and we don't build a profile of you.
>
> To stop spam, we briefly use your IP address to limit repeated signups. It's kept for a few minutes and is never stored with your email.
>
> **Why we collect it**
> Only to email you about fltr's launch and major updates. We never sell your email, share it with advertisers or use it to target you.
>
> **Who handles it**
> - Resend sends our emails and stores the waitlist.
> - Vercel hosts this website.
> - [Upstash limits repeated signups.]
>
> Each one processes data only to provide its service to us.
>
> **No tracking**
> This site has no ads, no analytics, no cookies and no tracking pixels. Our emails don't track whether you open them or click their links.
>
> **If you don't confirm**
> We only add you to the waitlist after you click the confirmation link. If you never click it, you're not on the list. Our email provider keeps a record of the confirmation email it sent for a limited time.
>
> **How long we keep it**
> Until you unsubscribe or ask us to delete it.
>
> **Your choices**
> - Every email has an unsubscribe link.
> - To see, correct or delete your data, email [hello@fltr.world]. We'll respond within 30 days.
>
> **Children**
> fltr.world isn't directed at children under 13.
>
> **Changes**
> If we change this policy, we'll update the date above. If the change matters, we'll also email everyone on the waitlist.
>
> **Contact**
> [YOUR NAME OR COMPANY], [CONTACT ADDRESS]
> [hello@fltr.world]

Notes for implementation:
- Include the "[Upstash…]" line only if `UPSTASH_REDIS_REST_URL` is configured. Otherwise remove the bullet entirely, not just its brackets.
- Link "Resend" and "Vercel" to their current privacy policy pages. Look up the URLs; don't guess them.

---

## 7. Demo: behavior spec

Build this as one client component (`components/demo/`) with pure logic split into `lib/fltr.ts` so it can be unit-tested.

### 7.1 Data

Put this in `lib/sample-data.ts`. Dial values run 0–10, and story attributes run 0–1 (a missing attribute means 0).

```ts
export const DIALS = [
  { id: 'solutions', label: 'Solutions',  key: 'solutions' },
  { id: 'local',     label: 'Local',      key: 'local' },
  { id: 'deep',      label: 'Deep dives', key: 'deep_dives' },
  { id: 'outrage',   label: 'Outrage',    key: 'outrage' },
  { id: 'hype',      label: 'Hype',       key: 'hype' },
  { id: 'rumor',     label: 'Rumors',     key: 'rumors' },
] as const;

export const FLTRS = [
  {
    id: 'climate', name: 'Climate without doom', sources: ['news', 'bluesky', 'youtube'],
    preset: { solutions: 9, local: 6, deep: 6, outrage: 1, hype: 1, rumor: 0 },
    stories: [
      { title: 'Cities expand tree planting to cool hot streets', solutions: 1, local: 0.6, deep: 0.3 },
      { title: 'How heat pumps work, in plain terms', solutions: 0.7, deep: 0.8 },
      { title: 'A farm cooperative tries drought-tolerant crops', solutions: 0.8, local: 0.4, deep: 0.5 },
      { title: 'Scientists warn it may already be too late', outrage: 0.6, hype: 0.7 },
      { title: 'A celebrity’s private jet sparks online fury', outrage: 1, hype: 0.4 },
      { title: 'The quiet math behind grid-scale batteries', deep: 1, solutions: 0.5 },
    ],
  },
  {
    id: 'ai', name: 'AI signal, no hype', sources: ['news', 'papers', 'bluesky'],
    preset: { solutions: 5, local: 4, deep: 8, outrage: 2, hype: 0, rumor: 0 },
    stories: [
      { title: 'What changed in this week’s open-model releases', deep: 0.6 },
      { title: 'A plain guide to recent AI pricing changes', deep: 0.5, solutions: 0.3 },
      { title: 'Researchers publish a new benchmark for long tasks', deep: 0.9 },
      { title: 'This AI will replace every job by spring, founder claims', hype: 1, outrage: 0.3 },
      { title: 'Leaked memo hints at a secret model, sources say', rumor: 1, hype: 0.6 },
      { title: 'Local library starts free AI basics classes', local: 1, solutions: 0.6 },
    ],
  },
  {
    id: 'f1', name: 'F1, no rumors', sources: ['news', 'youtube', 'podcasts'],
    preset: { solutions: 5, local: 4, deep: 8, outrage: 2, hype: 2, rumor: 0 },
    stories: [
      { title: 'Race recap: the strategy calls that decided the podium', deep: 0.8 },
      { title: 'Next season’s calendar, as officially announced', deep: 0.3 },
      { title: 'Explainer: how tire wear shapes a race', deep: 1 },
      { title: 'Is a star driver about to switch teams? Paddock whispers', rumor: 1, hype: 0.5 },
      { title: 'Fans furious over a controversial penalty', outrage: 1 },
      { title: 'A grassroots karting track opens near the city', local: 1, solutions: 0.3 },
    ],
  },
  {
    id: 'local', name: 'Local, minus the crime-bait', sources: ['local news', 'council feeds'],
    preset: { solutions: 7, local: 10, deep: 6, outrage: 1, hype: 2, rumor: 0 },
    stories: [
      { title: 'Council approves a plan to extend library hours', local: 1, solutions: 0.6 },
      { title: 'New bike lanes open on the east side next week', local: 1, solutions: 0.5 },
      { title: 'This weekend: free museum day and a farmers market', local: 1 },
      { title: 'Crime wave? What the numbers actually show', local: 0.6, deep: 0.9 },
      { title: 'Neighbors clash online over a new apartment block', local: 0.7, outrage: 1 },
      { title: 'Viral post claims a store is closing (it isn’t)', rumor: 1, local: 0.5 },
    ],
  },
];

// "Start from scratch": all dials at 5, stories = every story from the four fltrs above.
export const BLANK_FLTR = {
  id: 'blank', name: 'Start from scratch', sources: ['news', 'bluesky', 'youtube', 'podcasts'],
  preset: { solutions: 5, local: 5, deep: 5, outrage: 5, hype: 5, rumor: 5 },
  stories: FLTRS.flatMap((f) => f.stories),
};
```

### 7.2 fltr list ("Your fltrs")
- Five full-width `<button aria-pressed>` rows, each at least 56px tall: the four fltrs, then "Start from scratch".
- Each row shows the name (Plex Sans 16px bold) and, below it, the file name (Plex Mono 12.5px at 75% opacity). The file name is the slugified name plus `.fltr` (section 7.6), or `new.fltr` for Start from scratch.
- **Selected row:** reversed colors (highlight background, on-highlight text).
- **Other rows:** transparent background, `--fltr-text`.
- Choosing a row loads its `preset` into the dials. "Climate without doom" is the default.

### 7.3 Dials
- Six labeled `<input type="range" min=0 max=10 step=1>` elements with `accent-color: var(--fltr-highlight)`.
- Each row is a grid: a visible `<label>` (Plex Sans 15px), the slider, and a readout word (Plex Mono 13px, muted). Rows are at least 44px tall.
- **Readout:** 0 → "off", 1–4 → "less", 5 → "neutral", 6–9 → "more", 10 → "max". Set it as `aria-valuetext` too.
- **Remixed** means any dial differs from the current fltr's preset. When remixed:
  - A **Back to original** button appears next to the dials heading (Plex Mono 13px, 1px lines border, transparent background). It resets the dials to the preset.
  - The status line switches to `editing …`.
- **Note under the dials (muted, 14px):**
  - "Moving any dial makes it your own remix. The original stays as it was."
  - For Start from scratch: "Start from neutral and set each dial. The file below updates as you go."

### 7.4 Ranking and ++tags

```
for each story in fltr.stories:
  contribution(d) = ((dial[d] - 5) / 5) * (story[d] ?? 0)
  score = sum of contribution(d) over all dials
  tags  = dials with a positive contribution, largest first, top 2,
          each written "++" + label lowercased with spaces as hyphens
          (e.g. "++solutions ++local", "++deep-dives")
          or, if none is positive, "widely covered"
sort by score, highest first; show the top 3
```

### 7.5 Homepage preview block
- Page colors, 6px radius, padding `clamp(18px, 2.5vw, 28px)`.
- **Header row:** a 2px `--fltr-page-text` bottom border.
  - Left: **Your homepage** (Plex Sans 700, `clamp(21px, 2vw, 26px)`). Next to it, when remixed and not starting from scratch, a **your remix** badge: Plex Mono 12.5px, page-text background, page-background text.
  - Right: `fltr: <display name>` (Plex Mono 13px, page-muted). The display name is the fltr's name; for Start from scratch it's "Blank fltr", or "Your new fltr" once remixed.
- **Stories:** an `<ol>` grid, `repeat(auto-fit, minmax(240px, 1fr))` with a 32px column gap, so the three stories sit side by side on wide screens and stack on phones. Each story shows:
  - The title: Plex Sans 20px bold, line-height 1.3.
  - The tags: Plex Mono **italic** 12.5px, page-muted.
- The list re-ranks instantly on every dial change. Animate reordering only if `prefers-reduced-motion` is not set.

### 7.6 The .fltr file

A `.fltr` file is UTF-8 JSON with the extension `.fltr`. Suggested media type: `application/vnd.fltr+json`.

```jsonc
{
  "format": "fltr@0.1",
  "name": "Climate without doom",          // remixed: "<name> (remix)"; from scratch: "New fltr" / "Your new fltr"
  "remix_of": "Climate without doom",      // only when a preset fltr is remixed
  "sources": ["news", "bluesky", "youtube"],
  "more": ["solutions"],                   // dial labels (lowercased) with value >= 7
  "less": ["outrage", "hype", "rumors"],   // dial labels (lowercased) with value <= 3
  "dials": { "solutions": 9, "local": 6, "deep_dives": 6, "outrage": 1, "hype": 1, "rumors": 0 }
}
```

- Render it with `JSON.stringify(spec, null, 2)`, keeping the key order shown.
- **File name:** the `name` value slugified (lowercase, runs of non-alphanumerics become `-`, trimmed) plus `.fltr`. For example: `climate-without-doom.fltr`, `climate-without-doom-remix.fltr`, `new-fltr.fltr`, `your-new-fltr.fltr`. It appears in the file-name bar and the demo's status line.
- Treat this shape as **v0.1 of the open .fltr format** and put the TypeScript type in `lib/fltr-spec.ts`.

---

## 8. Waitlist with Resend: double opt-in

**Resend context (verified Oct 2026):**
- Resend uses **global Contacts** organized into **Segments**. The old Audiences API is deprecated, so don't use `audienceId`.
- Resend recommends **Topics** for each email type. Recipients manage Topics on Resend's unsubscribe preference page.
- References: [Migrating from Audiences to Segments](https://resend.com/docs/dashboard/contacts/migrating-from-audiences-to-segments) · [Create Contact](https://resend.com/docs/api-reference/contacts/create-contact) · [Add Contact to Segment](https://resend.com/docs/api-reference/contacts/add-contact-to-segment).

### 8.1 One-time Resend setup (I'll do these in the dashboard and give you the IDs)
1. Verify the domain `fltr.world` in Resend by adding its SPF/DKIM DNS records.
2. Create a Segment named **Waitlist**, which gives `RESEND_WAITLIST_SEGMENT_ID`.
3. Create a Topic named **Launch updates**, which gives `RESEND_LAUNCH_TOPIC_ID`.
4. Turn **off** open tracking and click tracking for the `fltr.world` domain. The privacy page promises this.

### 8.2 Flow
1. **The user submits the form**, which calls `POST /api/waitlist` with `{ email, company }`. `company` is a hidden honeypot field.
2. **The server:**
   - Validates the email with zod: trim it, lowercase it, cap it at 254 characters.
   - If the honeypot is filled, or the form was submitted under 2 seconds after load, it returns success silently and does nothing.
   - It rate-limits per IP (see 8.4).
   - It creates a **signed confirmation token**: base64url(`{ email, exp }`) + `.` + HMAC-SHA256 signature using `WAITLIST_TOKEN_SECRET`, with a 48-hour expiry. Use Node's `crypto` with a constant-time compare, and no database.
   - It sends the **confirmation email** via `resend.emails.send` with a React Email template.
   - It always returns the same generic success response, so the endpoint can't be used to check which emails are on the list.
3. **The user clicks the email link** to `GET /confirm?token=…`, a server component page.
   - An invalid or expired token shows: "This link has expired or isn't valid. Head back to fltr.world and sign up again." with a link to `/#join`.
   - A valid token calls:
     ```ts
     await resend.contacts.create({
       email,
       unsubscribed: false,
       segments: [{ id: process.env.RESEND_WAITLIST_SEGMENT_ID! }],
       topics: [{ id: process.env.RESEND_LAUNCH_TOPIC_ID!, subscription: 'opt_in' }],
     });
     ```
     If the contact already exists, treat that as success. Then make sure they're in the Segment with `resend.contacts.segments.add({ email, segmentId })` and opted in to the Topic. Check the SDK's actual error shape and handle it explicitly rather than swallowing all errors.
   - On success, show: "You're on the list. We'll email you when fltr opens." with a link back home.
   - Optionally send a short welcome email, behind `SEND_WELCOME_EMAIL=true`.
   - Style `/confirm` like the rest of the site: grayscale, Plex Mono heading, Plex Sans body.

### 8.3 Emails (React Email, in `emails/`)
- **From:** `fltr <hello@fltr.world>`, taken from `EMAIL_FROM`.
- **Confirmation email:**
  - Subject: "Confirm your spot on the fltr waitlist"
  - Body: one sentence, a reversed-color button "Confirm my spot", the plain-text link as a fallback, and "If you didn't sign up, ignore this email."
  - Use the same grayscale token values as hex. Email clients can't read CSS variables, so export the token values from a shared `lib/tokens.ts` that `globals.css` is also checked against.
  - Use a monospace font stack with web-safe fallbacks for headings.
- Include a plain-text version of every email.

### 8.4 Abuse protection
- Honeypot and minimum submit time, as described in 8.2.
- Rate limit: 5 requests per IP per 10 minutes. Use `@upstash/ratelimit` with Upstash Redis if `UPSTASH_REDIS_REST_URL` is set. Otherwise fall back to a best-effort in-memory limiter, and add a TODO noting that it doesn't hold across serverless instances.
- Never log full email addresses. Log the domain or a hash.

### 8.5 Environment variables (`.env.example`)
```
RESEND_API_KEY=
RESEND_WAITLIST_SEGMENT_ID=
RESEND_LAUNCH_TOPIC_ID=
EMAIL_FROM="fltr <hello@fltr.world>"
WAITLIST_TOKEN_SECRET=          # 32+ random bytes, base64
NEXT_PUBLIC_SITE_URL=https://fltr.world
SEND_WELCOME_EMAIL=false
UPSTASH_REDIS_REST_URL=         # optional
UPSTASH_REDIS_REST_TOKEN=       # optional
```

---

## 9. Quality bar

- **Accessibility:**
  - Real `<button>`, `<label>` and `<input>` elements, with every control reachable by keyboard.
  - Use the focus ring from section 4.
  - Text contrast at least 4.5:1, or 3:1 for text 24px and up. The default tokens pass; keep them passing if the values change.
  - The text-art logo and the cursor get `aria-hidden`.
  - Form errors are linked to the input with `aria-describedby`, and the success message uses `role="status"`.
  - ++tags are visual shorthand, so also give each story a screen-reader-only line such as "Boosted by solutions and local", or "Widely covered".
- **Motion:** only the H1 cursor blink and the optional list reorder. Disable both under `prefers-reduced-motion`.
- **Responsive:** check at 360, 768, 1024 and 1440px wide. The controls row stacks, the homepage stories stack, and nothing scrolls horizontally except the code block.
- **Performance:** Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO. The page is static except the API route and `/confirm`.
- **Privacy:** no third-party scripts, cookies or tracking pixels.

---

## 10. SEO and meta
- Title: "fltr: choose your own algorithm"
- Description: "fltr.world is an open-source homepage where you choose the algorithm. Pick, tune and share fltrs as open .fltr files. Join the waitlist."
- An OG image of 1200×630, built with `next/og`, on `--fltr-background`: the text-art logo, the H1 with the block cursor, and a small reversed-color "Climate without doom" row. Grayscale only.
- A favicon of a block cursor glyph, light on dark.
- `robots.txt` and `sitemap.xml` via the App Router conventions.

---

## 11. Suggested structure
```
app/
  layout.tsx            # fonts, metadata, globals.css
  page.tsx              # landing page sections
  confirm/page.tsx      # token verification + result
  privacy/page.tsx
  api/waitlist/route.ts
  opengraph-image.tsx
  globals.css           # the 10 grayscale tokens + Tailwind theme
components/
  site-header.tsx
  site-footer.tsx
  ascii-logo.tsx
  term.tsx              # monospace "fltr" inside running text
  waitlist-form.tsx
  principles.tsx
  demo/                 # demo-panel, fltr-list, dials, homepage-preview, fltr-file
emails/
  confirm-email.tsx
  welcome-email.tsx
lib/
  sample-data.ts
  fltr.ts               # ranking, ++tags, remix detection, .fltr builder + file naming (pure)
  fltr-spec.ts          # .fltr v0.1 type
  token.ts              # sign/verify confirmation tokens
  rate-limit.ts
  resend.ts             # client + contact helpers
  tokens.ts             # grayscale hex values for emails/OG
tests/
  fltr.test.ts
  token.test.ts
  e2e/waitlist.spec.ts  # mock Resend in e2e
```

---

## 12. Updating the existing prototype

If the codebase was built from the earlier "tape deck" spec:

1. **Keep as is:**
   - The waitlist API route and confirmation token logic.
   - Rate limiting, the Resend helpers and `/confirm` logic.
   - The environment variables, the token tests and the e2e test setup.
2. **Replace the visual system:**
   - Swap the old color tokens in `globals.css` and `lib/tokens.ts` for the 10 grayscale tokens in section 4, and update the Tailwind theme names.
   - Replace the Unbounded and Atkinson Hyperlegible fonts with IBM Plex Mono and IBM Plex Sans.
   - Remove the offset shadows and any colored accents.
3. **Replace the demo:**
   - Delete the tape-deck components and build `components/demo/` per section 7.
   - Rename `TAPES` to `FLTRS` and `BLANK_TAPE` to `BLANK_FLTR`, with the new name "Start from scratch".
   - Update `lib/fltr.ts`: dial readouts are lowercase, and the why text becomes ++tags.
   - Update the unit tests to match.
4. **Rewrite all page copy** to match section 6 exactly. That includes the new hero, demo, format, principles and join copy, plus lowercase "fltr" and the `<Term>` component.
5. **Restyle** `/confirm`, `/privacy`, the emails, the OG image and the favicon to the grayscale system.
6. **Search the codebase** for leftover user-facing "tape", "cassette", "Filter"/"filter" and uppercase "FLTR". Remove them.

---

## 13. Acceptance criteria
- [ ] `pnpm dev` runs. `pnpm lint`, `pnpm typecheck` and `pnpm test` pass.
- [ ] Changing any value in the `:root` block of `globals.css` recolors the entire site. A grep for hex colors outside `globals.css` and `lib/tokens.ts` returns nothing.
- [ ] The page matches section 6 copy verbatim, including the text-art logo, the blinking cursor (off under reduced motion) and `<Term>` styling.
- [ ] The demo matches section 7. Unit tests cover:
  - ranking order
  - ++tags (including "widely covered" and hyphenated labels)
  - remix detection and Back to original
  - Start-from-scratch naming
  - the .fltr output and file names
- [ ] The homepage preview is clearly distinct from the controls, using the page colors and a full-width block.
- [ ] Submitting a valid email shows the success state and sends a confirmation email. Clicking the link creates the contact in the Waitlist segment and opts it in to Launch updates.
- [ ] Expired or tampered tokens show the error page. Duplicate signups and re-confirmations are handled gracefully.
- [ ] Honeypot and rate limiting work, and the API response never reveals whether an email already exists.
- [ ] Keyboard-only and screen-reader checks pass for the demo and the form. Lighthouse scores meet section 9.
- [ ] No user-facing "Filter", "filter", uppercase "FLTR", "tape" or "cassette" remains (section 1 terminology).
- [ ] A README covers local setup, the Resend dashboard steps from 8.1, the environment variables, and deploying to Vercel.

---

## 14. Working style
- Order of work, for both a fresh build and an update:
  1. Tokens and fonts
  2. Layout shell, header and footer
  3. Static sections
  4. Demo logic, with tests
  5. Demo UI
  6. Waitlist (reuse the existing code if present)
  7. Emails, `/confirm` and `/privacy` styling
  8. SEO
  9. README
- Make small, focused commits.
- When something in this spec is ambiguous, pick the simplest option that meets the acceptance criteria and leave a short note in the README's "Decisions" section.
- Don't invent claims or statistics in the copy. Use the text above verbatim.
