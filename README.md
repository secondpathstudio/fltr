# fltr.world landing page

The first public piece of fltr: a one-page site with an interactive demo (pick a fltr, turn the dials, watch the homepage and the `.fltr` file change) and a double opt-in waitlist on [Resend](https://resend.com). The full brief is [`FLTR_LANDING_SPEC.md`](./FLTR_LANDING_SPEC.md) (v2, Terminal design).

Stack: Next.js 16 (App Router, Cache Components), TypeScript strict, Tailwind CSS v4, React Email, Resend, zod, Vitest, Playwright, pnpm, Vercel.

## Local setup

```sh
pnpm install
cp .env.example .env.local   # optional for local dev, see below
pnpm dev                     # http://localhost:3000
```

You don't need any keys to work on the site locally. When `RESEND_API_KEY` is empty and `NODE_ENV` isn't `production`, `lib/resend.ts` uses a local outbox instead of Resend:

- confirmation emails go to `.outbox/emails.json` (open it and paste the link into your browser)
- confirmed contacts go to `.outbox/contacts.json`
- tokens are signed with a built-in dev-only secret if `WAITLIST_TOKEN_SECRET` isn't set

Set `RESEND_API_KEY` and the IDs in `.env.local` to send real email from your machine.

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit` |
| `pnpm test` | Vitest unit tests: demo logic, tokens, validation, rate limiting, plus repo guardrails |
| `pnpm test:e2e` | Playwright signup test against a production build on port 3200, with Resend mocked (run `pnpm exec playwright install chromium` once first). It uses `next start`, so it can run while `pnpm dev` is up |

`tests/guardrails.test.ts` enforces acceptance criteria on every test run:
- No hex colors appear outside `app/globals.css` and `lib/tokens.ts`, and the two files agree.
- Source contains no "filter" (apart from `Array.prototype.filter`), no uppercase "FLTR" (identifiers like `FLTRS` are fine), and no "tape" or "cassette".

## Resend dashboard setup (one time)

1. **Domain.** Under Domains, add `fltr.world` and create the SPF and DKIM DNS records it shows you. Wait until the domain shows as verified.
2. **Segment.** Under Contacts → Segments, create a segment named **Waitlist**. Its ID is `RESEND_WAITLIST_SEGMENT_ID`.
3. **Topic.** Under Contacts → Topics, create a topic named **Launch updates**. Its ID is `RESEND_LAUNCH_TOPIC_ID`. Recipients manage it from Resend's unsubscribe preference page.
4. **Tracking off.** In the `fltr.world` domain settings, turn off open tracking and click tracking. The privacy page promises the emails don't track either.
5. **API key.** Create an API key with sending and contacts access. That's `RESEND_API_KEY`.

This uses global Contacts with Segments and Topics. The deprecated Audiences API (`audienceId`) isn't used.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Production | Resend API key |
| `RESEND_WAITLIST_SEGMENT_ID` | Production | ID of the **Waitlist** segment |
| `RESEND_LAUNCH_TOPIC_ID` | Production | ID of the **Launch updates** topic |
| `EMAIL_FROM` | No | Defaults to `fltr <hello@fltr.world>` (lowercase name) |
| `WAITLIST_TOKEN_SECRET` | Production | 32+ random bytes, e.g. `openssl rand -base64 32`. Rotating it invalidates links that haven't been clicked yet |
| `NEXT_PUBLIC_SITE_URL` | No | Used for confirm links, metadata, robots and sitemap. Defaults to `https://fltr.world` |
| `SEND_WELCOME_EMAIL` | No | `true` sends a short welcome email after a first confirmation |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Recommended | Shared rate limiting. Without them, a per-instance in-memory limiter is used. Setting the URL also adds the Upstash line to `/privacy`. It's read at build time, so redeploy after changing it |
| `RESEND_MOCK_OUTBOX` | No | Path for the local outbox mock (used by Playwright). Ignored on Vercel |

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel. The framework preset is detected as Next.js, and pnpm is picked up from `packageManager`.
2. Add the environment variables above for Production (and Preview, if previews should send real email).
3. Optionally add an Upstash Redis integration from the Vercel Marketplace. It sets the two `UPSTASH_*` variables.
4. Deploy, then under Settings → Domains add `fltr.world` (and `www.fltr.world` redirecting to it).
5. Smoke test: sign up with a real address, click the link, and check the contact appears in the Waitlist segment and is opted in to Launch updates.

What's static: `/`, `/privacy`, the OG image, the favicon, `robots.txt` and `sitemap.xml`. What runs on request: `POST /api/waitlist` and `/confirm`.

## How it works

- **Tokens** (`lib/token.ts`): `base64url({ email, exp })` + `.` + HMAC-SHA256 with `WAITLIST_TOKEN_SECRET`, expiring after 48 hours and compared in constant time. No database.
- **`POST /api/waitlist`**: rate limit (5 per IP per 10 minutes) → honeypot and minimum submit time → zod validation → send the confirmation email. Every accepted request, including duplicates and bots, gets the same `{ ok: true }`.
- **`/confirm?token=…`**: verifies the token, then `contacts.create` with the segment and topic. If the contact already exists, it calls `contacts.segments.add` and `contacts.topics.update` to make sure both are set. Any other Resend error shows a "try again" page and is logged.
- **Logging**: never the full address, only `domain#hash` (`redactEmail` in `lib/waitlist.ts`). Error text from providers is scrubbed too.
- **The demo**: `components/demo/` is one client component (fltr list, dials, homepage preview, live file). All the logic lives in `lib/fltr.ts` (ranking, ++tags, remix detection, naming, .fltr builder) and is unit-tested.
- **The .fltr format**: `lib/fltr-spec.ts` holds the v0.1 type.

## Decisions

Notes on places where the spec left room, or where something changed under it.

- **`react-email` instead of `@react-email/components`.** The spec names `@react-email/components`, but it (and `@react-email/render`) is deprecated on npm. Resend merged all components and `render` into the `react-email` package, so templates import from there. It's the same code under the maintainers' new package name.
- **No blinking caret.** The spec (sections 4, 6.2 and 10) calls for a blinking block cursor after the H1 and in the OG image. It was removed at the owner's request, so nothing on the page animates on its own. The only motion left is the optional story reorder, which is off under `prefers-reduced-motion`. The favicon is still a static block glyph.
- **One name for Start from scratch.** The spec used three ("Blank fltr" in the preview, `new.fltr` in the list, "New fltr" in the file). Everything now uses "New fltr" (`new-fltr.fltr`), then "Your new fltr" (`your-new-fltr.fltr`) once a dial moves. `fileName()` in `lib/fltr.ts` is the single source.
- **A simpler demo panel.** At the owner's request, the "Your fltrs" rows show only the name, and the spec's title bar (`fltr.world/demo` and the `editing <file>` status line) is removed. The current file name appears only in the file-name bar of the format section. The "your remix" badge and Back to original still mark a changed fltr.
- **Footer.** At the owner's request, "Built in the open." is removed. The footer shows "fltr.world" on the left and the Privacy link on the right.
- **Dial note copy.** At the owner's request, it reads "Moving any dial makes it your own fltr. The original stays as it was." instead of "…your own remix…".
- **++tag ties** keep dial order. **Ranking ties** keep the stories' original order, so Start from scratch at neutral shows the first three stories, all "widely covered".
- **Breakpoints.** The controls row and the format section switch from one column to two at 768px. The arrow beside "This example updates…" uses the same breakpoint: ↓ before the text when stacked, → after it side by side.
- **Section order** follows the numbering in the spec: hero, demo, format, principles, join.
- **Principles** have a visually hidden "Principles" heading, so the `<dl>` has a heading for screen-reader navigation.
- **Plex Mono italic** is loaded as its own 400-italic face (`--font-mono-italic`) and used only for the ++tags, so the other weights don't pull in italic files.
- **Emails use the light page tokens** (`page`, `page-text`, `page-muted`), with a dark "reversed" button. Email clients invert dark backgrounds unpredictably. Everything is still grayscale and comes from `lib/tokens.ts`.
- **Header links** point to `/#demo`, `/#format` and `/#join`, so they also work from `/privacy` and `/confirm`, which share the header.
- **Privacy page.** The copy is verbatim, `[BRACKETED]` placeholders included. The Upstash bullet only appears when `UPSTASH_REDIS_REST_URL` is set, and then without brackets. Resend and Vercel link to `https://resend.com/legal/privacy-policy` and `https://vercel.com/legal/privacy-policy` (both checked 2026-10-16).
- **Minimum submit time.** The API is stateless, so the client sends `elapsedMs` (time since page load) along with `{ email, company }`, and the server treats anything under 2 seconds, or a missing value, as a bot. A determined bot can fake it. The honeypot and rate limit are the other two layers.
- **The form needs JavaScript.** It posts JSON with `fetch`. It appears twice (hero and Join), each with its own IDs from `useId`. Only the Join copy has the privacy link.
- **Duplicate contacts.** Resend doesn't document an error code for "contact already exists". `isAlreadyExistsError` in `lib/resend.ts` matches HTTP 409 or an "already exists" message, and anything else is treated as a real failure. **Check this against the live API once** by confirming the same address twice.
- **Re-confirmation** shows the same success page. The welcome email (when it's on) only goes out on the first confirmation.
- **Confirming on GET**, as the spec asks. Some corporate link scanners open links before people do, which can confirm an address early. If that becomes a problem, switch `/confirm` to a "Confirm my spot" button that submits a POST.
- **Errors on `/confirm`.** A third state, "Something went wrong on our side. Try the link again in a minute.", covers Resend outages and missing configuration, so a working link isn't reported as expired.
- **Rate-limit message.** The spec gives two example errors. A 429 shows "That's a lot of tries in a short time. Wait a few minutes and try again."
- **Accessibility extras.** A hidden "Top story: …" line is a polite live region. After "Back to original", focus moves to the dials heading because the button disappears. The code block is focusable so keyboard users can scroll it.
- **Theme color, emails and the OG image** use `lib/tokens.ts`, because they can't read CSS variables. If you change a value in `globals.css`, change it there too. The guardrail test fails until you do.
- **OG fonts.** `assets/fonts/` holds static IBM Plex Mono 400/700 TTFs (OFL) for `next/og`, which can't use `next/font`.
