# FLTR landing page: build spec

You're building the first public piece of **FLTR** (fltr.world): a one-page landing site with an interactive "tape deck" demo and an email waitlist powered by **Resend**. This file is the complete brief. Read it fully before writing code, then work through the acceptance criteria at the end.

---

## 1. Context

FLTR is a homepage for the internet where **you choose the algorithm**. Each algorithm is called a **FLTR**: a small, portable rule set that works like a cassette tape. You can play one, remix it on a mixing deck, or record your own, and every FLTR saves as a plain **.fltr** file in an open format.

### Terminology (use consistently in copy and code)
- **FLTR** (all caps) is the formal name of an algorithm. The plural is **FLTRs**; write "a FLTR".
- **.fltr** (lowercase, with the dot) is the file format and file extension.
- **fltr.world** is the site. Where "FLTR" alone could mean either the product or an algorithm, use fltr.world for the product.
- Never use "Filter" or "filter" in UI copy.

The landing page must:

1. Explain that idea in five seconds through a working demo, not a wall of text.
2. Collect waitlist emails with double opt-in, using Resend.
3. Live the manifesto: no ads, no third-party trackers, accessible, fast.

---

## 2. Scope

**In scope**
- A single landing page at `/`.
- An interactive tape deck demo running entirely client-side with hardcoded sample data.
- A waitlist signup with double opt-in: a confirmation email, a confirm page, and the contact saved in Resend.
- A confirm-result page at `/confirm`.
- A minimal `/privacy` page.
- SEO basics: title, description, Open Graph image, favicon.
- Deployed to Vercel on `fltr.world`.

**Out of scope for now:** user accounts, a real content pipeline, saving FLTRs, payments, analytics dashboards, any CMS.

---

## 3. Stack

Use these. Ask before adding other dependencies.

| Concern | Choice |
| --- | --- |
| Framework | Next.js, latest stable, App Router, TypeScript in strict mode |
| Styling | Tailwind CSS v4, with all colors defined once as CSS variables (section 4) |
| Fonts | `next/font/google`: **Unbounded** (500, 700, 900) for display; **Atkinson Hyperlegible** (400, 700) for body |
| Email | `resend` Node SDK + `@react-email/components` for templates |
| Validation | `zod` |
| Tests | Vitest for units; Playwright for one end-to-end signup test |
| Package manager | pnpm |
| Hosting | Vercel |
| Analytics | None at launch. If added later: cookieless only (e.g. Vercel Web Analytics), behind an env flag |

---

## 4. Design tokens: the color "globals"

**Every color in the app comes from these 10 CSS variables, defined once in `app/globals.css`.** No hex values anywhere else: no inline styles, no Tailwind arbitrary values like `bg-[#0078BF]`. Changing a value here must retheme the whole site.

```css
:root {
  --fltr-primary:    #0078BF; /* headlines, buttons, borders, selected tape, code block */
  --fltr-accent:     #FF48B0; /* offset shadows, label stripes, sliders, focus rings, principle bars */
  --fltr-ink:        #0D3B66; /* body text */
  --fltr-muted-text: #2E5B85; /* secondary text */
  --fltr-paper:      #FBFCFD; /* page background */
  --fltr-surface:    #FFFFFF; /* cards, inputs, unselected tapes */
  --fltr-deck-tint:  #EAF3FA; /* deck panel background */
  --fltr-label-tint: #FFB8DF; /* tape labels, "Your remix" badge, signup confirmation */
  --fltr-lines:      #9CC8E6; /* dotted rules, dial borders, blank-tape dashed label */
  --fltr-on-primary: #FFFFFF; /* text and reels on primary-colored fills */
}

@theme inline {
  --color-primary: var(--fltr-primary);
  --color-accent: var(--fltr-accent);
  --color-ink: var(--fltr-ink);
  --color-muted: var(--fltr-muted-text);
  --color-paper: var(--fltr-paper);
  --color-surface: var(--fltr-surface);
  --color-deck: var(--fltr-deck-tint);
  --color-label: var(--fltr-label-tint);
  --color-lines: var(--fltr-lines);
  --color-on-primary: var(--fltr-on-primary);
}
```

Translucent variants, like the unselected tape's soft shadow, use `color-mix(in srgb, var(--fltr-primary) 25%, transparent)` rather than new hex values.

**Signature look:** flat "risograph" offset shadows, such as `box-shadow: 6px 6px 0 var(--fltr-accent)`, with no blur and no gradients. Corner radii are 12–22px, with larger radii on larger containers. Borders are 2px in `--fltr-primary`.

---

## 5. Typography

- **Display** (H1, H2, wordmark, deck titles): Unbounded 700, with the wordmark at 900. Letter-spacing -0.02em on the H1.
- **Body:** Atkinson Hyperlegible 400/700 at 16–21px, line-height 1.5–1.6.
- **Code block:** system monospace stack (`ui-monospace, 'SF Mono', Menlo, Consolas, monospace`) at 14px.
- **Scale:** H1 `clamp(40px, 6vw, 84px)`, line-height 1.02. Section H2 `clamp(28px, 3.4vw, 48px)`.
- Use sentence case everywhere, with no all-caps labels. Keep line length under ~75 characters.

---

## 6. Page structure and exact copy

Content container: max-width 1200px, centered, horizontal padding `clamp(16px, 4vw, 48px)`. All layouts use flex/grid with wrapping, so they stack cleanly at 360px wide.

### 6.1 Header
- Left: wordmark **FLTR** (Unbounded 900, 26px, `--fltr-primary`, `text-shadow: 3px 2px 0 var(--fltr-accent)`). It links to `#join`.
- Right: a text link "The .fltr format" to `#format`, and a pill link "Join the waitlist" to `#join`, with a 2px primary border.

### 6.2 Hero
- **H1:** Your algorithm, in your pocket.
- **Paragraph:** A FLTR is an algorithm you own. Play one, remix it on the deck, or record your own from a blank, then take it to any app that reads .fltr files.

### 6.3 Tape deck (interactive; full spec in section 7)
- A row of 5 tape buttons.
- Below it, the deck panel. Left: the "Now playing" homepage preview. Right: "Remix this tape" with 6 dials.

### 6.4 Open format (`id="format"`)
- **H2:** Every FLTR is a plain .fltr file.
- **Paragraph:** Read it, fork it, and run it on fltr.world or any app that reads the open .fltr format. Your algorithm belongs to you, not to the platform.
- **Small paragraph (muted):** Move a dial on the deck above and watch this file change.
- **File-name tab:** sits on top of the code block and shows the current file name, e.g. `climate-without-doom.fltr` (section 7.5). Label-tint background, ink text, monospace bold, 2px primary border with no bottom edge.
- **Code block:** a live view of the current .fltr file (section 7.5). Primary background, on-primary text, `8px 8px 0` accent shadow, square top-left corner where the tab joins, horizontal scroll on overflow.

### 6.5 Waitlist (`id="join"`)
- **H2:** Record your first FLTR at launch.
- A visible label "Email address", an email input (placeholder `you@example.com`, `autocomplete="email"`) and a **Join the waitlist** button (primary fill, `4px 4px 0` accent shadow).
- **Note (muted):** Open source. No ads, ever. We'll only email you about the launch.
- A small link to `/privacy`: "How we handle your email".
- **Success state**, replacing the form, in `role="status"`: "Almost there. Check your inbox and click the link to confirm your spot."
- **Error state,** shown inline under the field in plain language. Examples: "That doesn't look like an email address. Check for typos and try again." and "Something went wrong on our side. Try again in a minute."

### 6.6 Principles (4 columns, wrapping; each has a 6px accent top border)
1. **No ads, ever.** FLTR is paid for by the people who use it, not by advertisers.
2. **Open source.** Read the code that ranks your homepage. Run it yourself if you like.
3. **Your algorithm travels.** FLTRs are plain .fltr files. Take yours to any app that reads them.
4. **Nothing hidden.** Every story shows its sources and why it's on your page.

These aren't a sequence, so don't number them visually.

### 6.7 Footer
- Left: "FLTR.world" (Unbounded 700, primary).
- Right: "Built in the open."
- Plus a `/privacy` link.

---

## 7. Tape deck: behavior spec

Build this as one client component (`components/tape-deck/`) with pure logic split into `lib/fltr.ts` so it can be unit-tested. Each tape in the UI represents one FLTR.

### 7.1 Data

Put this in `lib/sample-data.ts`. Dial values run 0–10, and story attributes run 0–1 (a missing attribute means 0).

```ts
export const DIALS = [
  { id: 'solutions', label: 'Solutions', key: 'solutions' },
  { id: 'local',     label: 'Local',     key: 'local' },
  { id: 'deep',      label: 'Deep dives', key: 'deep_dives' },
  { id: 'outrage',   label: 'Outrage',   key: 'outrage' },
  { id: 'hype',      label: 'Hype',      key: 'hype' },
  { id: 'rumor',     label: 'Rumors',    key: 'rumors' },
] as const;

export const TAPES = [
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

// Blank tape: all dials at 5, stories = every story from the four tapes above.
export const BLANK_TAPE = {
  id: 'blank', name: 'Blank tape', sources: ['news', 'bluesky', 'youtube', 'podcasts'],
  preset: { solutions: 5, local: 5, deep: 5, outrage: 5, hype: 5, rumor: 5 },
  stories: TAPES.flatMap((t) => t.stories),
};
```

### 7.2 Tapes row
- Five `<button aria-pressed>` elements, about 240×150px each. They wrap on small screens.
- Each tape has a label sticker with its name (label-tint background, 6px accent left border) and decorative reels drawn with CSS (`aria-hidden`).
- **Selected tape:** primary background, on-primary reels, lifted `translateY(-10px)`, `6px 6px 0` accent shadow.
- **Unselected tape:** surface background, primary border and reels, soft `3px 3px 0` shadow.
- **Blank tape:** dashed primary border when unselected, and a surface label with a dashed `--fltr-lines` border.
- Choosing a tape loads its `preset` into the dials. Climate is the default.

### 7.3 Dials
- Six labeled `<input type="range" min=0 max=10 step=1>` elements (`accent-color: var(--fltr-accent)`), each with a visible `<label>` and a readout word.
- **Readout:** 0 → "Off", 1–4 → "Less", 5 → "Neutral", 6–9 → "More", 10 → "Max". Set it as `aria-valuetext` too.
- **Remixed** means any dial differs from the current tape's preset. When a tape is remixed:
  - A "Your remix" badge appears next to the tape name. Blank tapes don't get the badge.
  - A **Back to original** button resets the dials to the preset.
- **Deck title:** "Remix this tape", or "Record your own" for the blank tape.
- **Deck note:** "Moving any dial makes your own remix. The original tape stays as it was." For the blank tape: "Start from neutral and set each dial. Your new FLTR appears in the .fltr file below."

### 7.4 Ranking (the "Now playing" list)

```
for each story in tape.stories:
  contribution(d) = ((dial[d] - 5) / 5) * (story[d] ?? 0)
  score = sum of contribution(d) over all dials
  why   = the dial with the largest positive contribution, as
          "Here because you turned up {label lowercased}"
          or, if none is positive, "Here because it’s widely covered today"
sort by score, highest first; show the top 3
```

- "Now playing" heading (muted), then the display name: the tape name, or "Blank tape" / "Your new FLTR" for a remixed blank.
- Each item shows its title (18px bold) and its why line (15px muted), separated by 2px dotted `--fltr-lines` rules.
- The list re-ranks instantly on every dial change. Animate reordering only if `prefers-reduced-motion` is not set.

### 7.5 The .fltr file (live view in the open-format section)

A `.fltr` file is UTF-8 JSON with the extension `.fltr`. Suggested media type: `application/vnd.fltr+json`.

```jsonc
{
  "format": "fltr@0.1",
  "name": "Climate without doom",          // remixed: "<name> (remix)"; blank: "Blank tape" / "Your new FLTR"
  "remix_of": "Climate without doom",      // only when a non-blank tape is remixed
  "sources": ["news", "bluesky", "youtube"],
  "more": ["solutions"],                   // dial labels (lowercased) with value >= 7
  "less": ["outrage", "hype", "rumors"],   // dial labels (lowercased) with value <= 3
  "dials": { "solutions": 9, "local": 6, "deep_dives": 6, "outrage": 1, "hype": 1, "rumors": 0 }
}
```

Render it with `JSON.stringify(spec, null, 2)` in a `<pre aria-label="The current FLTR as a .fltr file">`, keeping the key order shown.

**File name:** the `name` value slugified (lowercase, runs of non-alphanumerics become `-`, trimmed) plus `.fltr`. For example: `climate-without-doom.fltr`, `climate-without-doom-remix.fltr`, `blank-tape.fltr`, `your-new-fltr.fltr`. Show it in the file-name tab (section 6.4).

Treat this shape as **v0.1 of the open .fltr format** and put the TypeScript type in `lib/fltr-spec.ts`.

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
   - On success, show: "You're on the list. We'll email you when FLTR opens." with a link back home.
   - Optionally send a short welcome email, behind `SEND_WELCOME_EMAIL=true`.

### 8.3 Emails (React Email, in `emails/`)
- **From:** `FLTR <hello@fltr.world>`, taken from `EMAIL_FROM`.
- **Confirmation email:**
  - Subject: "Confirm your spot on the FLTR waitlist"
  - Body: one sentence, a primary button "Confirm my spot", the plain-text link as a fallback, and "If you didn't sign up, ignore this email."
  - Use the same color tokens as hex values. Email clients can't read CSS variables, so export the token values from a shared `lib/tokens.ts` that `globals.css` is also checked against.
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
EMAIL_FROM="FLTR <hello@fltr.world>"
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
  - Focus rings: `outline: 3px solid var(--fltr-accent); outline-offset: 3px`.
  - Text contrast at least 4.5:1, or 3:1 for text 24px and up.
  - Decorative reels get `aria-hidden`.
  - Form errors are linked to the input with `aria-describedby`, and the success message uses `role="status"`.
- **Motion:** only the tape lift (0.25s) and the optional list reorder. Disable both under `prefers-reduced-motion`.
- **Responsive:** check at 360, 768, 1024 and 1440px wide. Tapes wrap, the deck stacks, and nothing scrolls horizontally except the code block.
- **Performance:** Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO. The page is static except the API route and `/confirm`.
- **Privacy:** no third-party scripts, cookies or tracking pixels.

---

## 10. SEO and meta
- Title: "FLTR: your algorithm, in your pocket"
- Description: "fltr.world is an open-source homepage where you choose the algorithm. Play, remix and share FLTRs as open .fltr files. Join the waitlist."
- An OG image of 1200×630, built with `next/og`: the wordmark, the H1 and a row of tapes in the token colors.
- A favicon showing a simple tape glyph in primary and accent.
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
  globals.css           # the 10 color tokens + Tailwind theme
components/
  site-header.tsx
  tape-deck/            # tapes row, deck, dials, now-playing, fltr-file
  waitlist-form.tsx
  principles.tsx
emails/
  confirm-email.tsx
  welcome-email.tsx
lib/
  sample-data.ts
  fltr.ts               # ranking, remix detection, .fltr builder + file naming (pure)
  fltr-spec.ts          # .fltr v0.1 type
  token.ts              # sign/verify confirmation tokens
  rate-limit.ts
  resend.ts             # client + contact helpers
  tokens.ts             # color hex values for emails/OG
tests/
  fltr.test.ts
  token.test.ts
  e2e/waitlist.spec.ts  # mock Resend in e2e
```

---

## 12. Acceptance criteria
- [ ] `pnpm dev` runs. `pnpm lint`, `pnpm typecheck` and `pnpm test` pass.
- [ ] Changing any value in the `:root` block of `globals.css` recolors the entire site. A grep for hex colors outside `globals.css` and `lib/tokens.ts` returns nothing.
- [ ] The tape deck matches section 7. Unit tests cover ranking order, the why text, remix detection, Back to original, blank-tape naming, the .fltr output and the file name.
- [ ] No "Filter" or "filter" appears in any user-facing copy (section 1 terminology).
- [ ] Submitting a valid email shows the success state and sends a confirmation email. Clicking the link creates the contact in the Waitlist segment and opts it in to Launch updates.
- [ ] Expired or tampered tokens show the error page. Duplicate signups and re-confirmations are handled gracefully.
- [ ] Honeypot and rate limiting work, and the API response never reveals whether an email already exists.
- [ ] Keyboard-only and screen-reader checks pass for the deck and the form. Lighthouse scores meet section 9.
- [ ] A README covers local setup, the Resend dashboard steps from 8.1, the environment variables, and deploying to Vercel.

---

## 13. Working style
- Build in this order: the token and layout shell, then static sections, then the tape deck logic with tests, then the deck UI, then the waitlist API with tests, then emails, then SEO, then the README.
- Make small, focused commits.
- When something in this spec is ambiguous, pick the simplest option that meets the acceptance criteria and leave a short note in the README's "Decisions" section.
- Don't invent claims or statistics in the copy. Use the text above verbatim.
