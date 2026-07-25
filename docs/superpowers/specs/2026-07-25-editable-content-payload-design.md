# Editable site content in Payload — design

**Date:** 2026-07-25
**Status:** approved, ready for implementation planning
**Supersedes:** the "source of truth" rule in `AGENTS.md`, which must be rewritten as part of this work.

## Goal

Let the client edit the site's content themselves through the Payload admin at `/admin`, with a
side-by-side live preview, without touching code. In scope:

- **Hero** — all text plus the backdrop photograph.
- **Rooms** — every card's text and image; add or remove cards, minimum one.
- **Experiences** — every card's text and image; add or remove cards, minimum one.
- **Gallery** — photos and captions; add or remove, minimum one.
- **Tariff & Booking** — sharing types and prices, meals, check-in/out times, notes.
- **Phone numbers** — every phone number rendered anywhere on the site.
- **Section titles** for the sections above.

Out of scope, staying in `src/lib/site.ts`: `SITE_URL`, `NAV_LINKS`, `ROUTES` (the Getting Here
routes table), `TESTIMONIALS`, `GOOGLE_REVIEWS`, `MAP_EMBED_SRC`, `MAP_DIRECTIONS_URL`, and the
About section's copy.

## Phone number inventory

Established before any change, as requested. There are **two independent groups** and **eight
render sites**.

### Group A — the homestay's own booking numbers

Source today: `CONTACT.phones` in `src/lib/site.ts:18-24`.
Values: `+91 98006 37784` (Bookings), `+91 70195 92753` (Bookings alt.).

| # | Render site | Numbers used |
|---|---|---|
| 1 | `src/components/Nav.tsx:91` — desktop header call button | `phones[0]` |
| 2 | `src/components/Nav.tsx:151` — mobile menu call link | `phones[0]` |
| 3 | `src/components/CallPill.tsx:28` — floating sticky call pill | `phones[0]` |
| 4 | `src/components/Tariff.tsx:141` — Reserve band buttons | both |
| 5 | `src/components/Footer.tsx:120` — footer contact column | both |
| 6 | `src/app/(frontend)/layout.tsx:101` — JSON-LD `telephone` (SEO) | `phones[0]` |

### Group B — the local driver (not the homestay)

Source today: `TRANSPORT_CONTACT` in `src/lib/site.ts:26-32`.
Values: Gopal Chhetri — `+91 94746 80915`, `+91 89186 78841`.

| # | Render site | Numbers used |
|---|---|---|
| 7 | `src/components/GettingHere.tsx:61` — transport card | both |
| 8 | `src/components/Footer.tsx:136` — footer transport column | both |

### Consequences for the design

- **Five of the eight sites use `phones[0]` implicitly.** Array order therefore decides what
  appears in the header, the floating call pill, and Google's structured data. The admin field
  description must say so explicitly, because it is otherwise invisible to the editor.
- **Each number is currently stored twice** — a display `number` and a `tel:` `href`. Storing
  both invites drift. In Payload only the display number is stored; the `href` is derived at
  render by a helper that strips non-digits.

## Content model

Six Payload globals. Globals (not collections) because each is a single instance. Repeatable
cards are `array` fields **inside** their section global, so `minRows: 1` enforces the
"minimum one card" rule in the admin UI and drag-to-reorder comes for free.

| Global slug | Admin label | Admin group |
|---|---|---|
| `hero` | Hero | Content |
| `rooms` | Rooms | Content |
| `experiences` | Experiences | Content |
| `gallery` | Gallery | Content |
| `tariff` | Tariff & Booking | Content |
| `site-settings` | Contact & Site Info | Settings |

Every global gets:

```ts
versions: { drafts: true, maxPerDoc: 20 },
access: {
  read: () => true,
  update: ({ req: { user } }) => Boolean(user),
},
admin: { group: 'Content', livePreview: { url: /* see Live Preview */ } },
```

Verified available in Payload 3.86.0: `GlobalConfig` supports `versions`
(`node_modules/payload/dist/globals/config/types.d.ts:259`) and `admin.livePreview` (same file,
line 197); `minRows` exists on array fields.

### `hero`

| Field | Type | Notes |
|---|---|---|
| `backgroundImage` | `upload` → `media`, required | Seeded with `hero-kanchenjunga.jpg` |
| `headlineLine1` | `text`, required | "Sunrise" |
| `headlineLine2` | `text`, required | "Viewpoint" |
| `headlineAccent` | `text`, max 2 chars, default `.` | The teal full stop |
| `subhead` | `textarea`, required | |
| `ctaLabel` | `text`, required | "Call to book" |

The CTA's `href="#tariff"` is structural, not content, and stays in the component. The hero's
eyebrow line (coordinates · altitude · region) is **not** here — it lives in `site-settings`
because the footer and the JSON-LD metadata render the same three facts, and duplicating them
would recreate the split-source problem this design exists to remove.

### `rooms`

| Field | Type | Notes |
|---|---|---|
| `title` | `text`, required | Emphasis convention, below |
| `items` | `array`, **`minRows: 1`**, required | |
| `items[].name` | `text`, required | "4-Sharing Rooms" |
| `items[].count` | `text`, required | "6 rooms" |
| `items[].occupancy` | `text`, required | "up to 4 guests per room" |
| `items[].tagline` | `textarea`, required | |
| `items[].features` | `array` of `{ value: text }`, `minRows: 1` | The chip row |
| `items[].image` | `upload` → `media`, required | |

### `experiences`

| Field | Type | Notes |
|---|---|---|
| `title` | `text`, required | |
| `items` | `array`, **`minRows: 1`**, required | |
| `items[].title` | `text`, required | |
| `items[].body` | `textarea`, required | |
| `items[].image` | `upload` → `media`, required | |
| `cardFooterLabel` | `text`, default `Aahaldara · Sittong III` | Currently hardcoded at `Experiences.tsx:95` |

The `01 / 06` card counter is already derived from array length and stays derived.

### `gallery`

| Field | Type | Notes |
|---|---|---|
| `title` | `text`, required | |
| `photos` | `array`, **`minRows: 1`**, required | |
| `photos[].image` | `upload` → `media`, required | |
| `photos[].caption` | `text`, required | |

### `tariff`

| Field | Type | Notes |
|---|---|---|
| `title` | `text`, required | |
| `rates` | `array`, **`minRows: 1`**, required | |
| `rates[].name` | `text`, required | "Triple sharing" |
| `rates[].amount` | `number`, required, `min: 0` | Rendered `₹{amount.toLocaleString('en-IN')}` |
| `rates[].unit` | `text`, required, default `per person / night` | |
| `rates[].note` | `text`, optional | "common washroom" |
| `mealsIncluded` | `array` of `{ value: text }`, `minRows: 1` | |
| `mealsExtra` | `array` of `{ value: text }` | May be empty |
| `checkIn` | `text`, required | "12:00 PM" |
| `checkOut` | `text`, required | "11:00 AM" |
| `firstLight` | `text`, default `05:30 IST` | Currently hardcoded at `Tariff.tsx:135` |
| `notes` | `array` of `{ value: textarea }`, `minRows: 1` | See "derived values" below |
| `reserveHeading` | `text`, required | "One phone call is all it takes." |

**Prices are numbers, not text.** Free-text prices invite a client typo (`1500`, `Rs 1500`)
shipping to a live pricing table. The cost is that a rate can no longer carry the `≈` hedge used
elsewhere in `site.ts`; for tariff rates that is correct, because these should be exact or
corrected by phone.

### `site-settings`

| Field | Type | Notes |
|---|---|---|
| `bookingPhones` | `array`, `minRows: 1`, `maxRows: 4` | Group A |
| `bookingPhones[].label` | `text`, required | "Bookings" |
| `bookingPhones[].number` | `text`, required, validated | Display form, e.g. `+91 98006 37784` |
| `transportName` | `text`, required | "Gopal Chhetri" |
| `transportPhones` | `array`, `minRows: 1` | Group B |
| `transportPhones[].number` | `text`, required, validated | |
| `coordinates` | `text`, required | Hero eyebrow + footer |
| `altitude` | `text`, required | `≈ 4,200 ft` — keeps the `≈` |
| `region` | `text`, required | |
| `address` | `textarea`, required | Footer + JSON-LD |

`bookingPhones` carries this `admin.description`:

> The **first** number in this list is the one shown in the site header, the floating call
> button, and Google's search listing. Drag to reorder.

Phone `number` fields validate as "contains at least 10 digits" and reject nothing else — Indian
numbers are written many ways and an over-strict regex would block a legitimate edit.

## Cross-cutting decisions

### Alt text lives on the Media document

`Media` already requires `alt` (`src/collections/Media.ts:9-14`). Image alts come from there;
no per-usage alt field. The client types alt once, at upload. Trade-off accepted: one photo
reused in two places cannot have two different alts. This removes a whole class of
"alt drifted out of sync with the image" bugs.

### Emphasised words in titles

Two titles wrap one word in `<em className="text-celadon">` — `Rooms.tsx:62` ("face *east*")
and `Tariff.tsx:32` ("*meals included*"). Rather than a rich-text editor for a single italic
word, titles are plain `text` where `*asterisks*` mark the accent, rendered by one shared helper:

```
src/lib/emphasis.tsx — renderEmphasis(title: string): ReactNode
```

It splits on `*…*` and wraps matches in `<em className="text-celadon">`. Each title field's
`admin.description` explains the convention.

### Section index and label stay in code

`SectionHeading` takes `index` ("02") and `label` ("Rooms") as well as `title`. The index/label
pair is the 01–07 numbering threaded through `NAV_LINKS`, `SectionHeading`, and the mobile nav
menu — an invariant `AGENTS.md` requires keeping in sync. **Only `title` becomes editable**, so
the client cannot break the numbering.

### Two values stay derived, one stops being derived

Staying derived (they self-correct as the client edits, so fields for them would go stale):

- `All {n} meals included` — from `mealsIncluded.length` (`Tariff.tsx:19`).
- `Hot water in every room` — from a regex over room features (`Tariff.tsx:15-17`).

No longer derived: `TARIFF_NOTES` (`site.ts:242-247`) currently interpolates the meals lists and
check-in times. It is in scope as editable, so it becomes a plain editable array seeded with
today's rendered strings. **The cost is real:** change `mealsIncluded` and the first note no
longer matches. Its `admin.description` must warn:

> This text does not update automatically. If you change the meals or check-in times above,
> update these notes to match.

### The Gallery mosaic must not break when photos are added

`Gallery.tsx:11-18` holds a fixed six-slot `LAYOUT` (7/5, then 4/4/4, then one full-bleed
panorama) and selects with `i % LAYOUT.length`. `site.ts:209-210` records that the last slot is
*"kept last on purpose: the gallery's full-bleed panorama slot — give it a landscape, not an
interior."* With a variable photo count, a seventh photo wraps to the 7-column slot and the
panorama intent silently dies.

**Fix:** derive the layout so the **last** photo always takes the full-bleed slot, and the
photos before it cycle the remaining five shapes. The client adds photos and the mosaic stays
composed with no layout knowledge required.

### The counting titles

"**Six** things worth leaving the veranda for." and "**Eight rooms** and camping tents." are now
editable text, but editable is not the same as correct. Their `admin.description` warns that the
title mentions a count and should be updated when cards are added or removed. The numbers are
**not** auto-generated — that would flatten copy the client wrote deliberately.

## Data flow

### Fetch layer — `src/lib/content.ts`

Server-only. One function per global, each wrapped in React `cache()` so a single request hits
Postgres once per global:

```ts
export const getHero = cache(async (draft: boolean) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'hero', draft, depth: 1 })
})
```

`depth: 1` is required so `upload` relationships arrive populated with their `url` and `alt`
rather than as bare IDs.

If a required global is unpopulated, the function throws a message naming the fix:

> Global "hero" has no content. Run `npm run seed` to populate it from src/lib/site.ts.

This makes a fresh clone fail loudly at build time instead of silently shipping a page with
empty sections.

### Page — `src/app/(frontend)/page.tsx`

Becomes an `async` server component. Reads draft state, fetches all six globals in one
`Promise.all`, and passes typed props into the components:

```ts
const { isEnabled: draft } = await draftMode()
const [hero, rooms, experiences, gallery, tariff, settings] = await Promise.all([...])
```

The five section components keep `"use client"` for GSAP and receive props instead of importing
`site.ts`. Props are plain JSON and serialize across the boundary without issue.

### Two consumers that are easy to miss

**`layout.tsx` needs two globals, not one.** It renders JSON-LD structured data from
`site.ts` today (`layout.tsx:3`, `84-101`) and must become `async` to fetch:

- `site-settings` — for `telephone` (first booking phone), `address`, and the `geo` block, which
  is parsed out of the coordinates string at `layout.tsx:84-86`.
- `tariff` — for `priceRange`, derived from the min and max rate at `layout.tsx:88-93`.

This yields a small cleanup: `layout.tsx:89-91` currently recovers numbers from formatted price
strings with `parseInt(t.price.replace(/[₹,]/g, ''), 10)`. Because `rates[].amount` is stored as
a number, that becomes `tariff.rates.map((r) => r.amount)` and the parsing hack disappears.

**The Tariff section depends on the Rooms global.** `Tariff.tsx:15-17` derives its
"Hot water in every room" highlight by regexing `ACCOMMODATIONS` features. That stays derived
per the decision above, so `<Tariff>` must receive **both** the `tariff` and `rooms` data. This
is the only cross-global dependency in the design; it needs a comment at the call site so nobody
later "tidies" the seemingly unused `rooms` prop away.

`sitemap.ts` uses only `SITE_URL` and is unaffected. `robots.ts` and `favicon.ico` are untouched
and stay at the `src/app/` root.

### No `next.config.ts` change

Payload serves uploads same-origin at `/api/media/file/<filename>`, so `images.remotePatterns`
needs no new entry. The Unsplash entry stays until the seed has confirmed the three stock photos
are local Media documents, then it can be removed in a follow-up.

## Live Preview

### Route — `src/app/(frontend)/next/preview/route.ts`

Validates a `PREVIEW_SECRET` token, calls `(await draftMode()).enable()`, redirects to `/`.
Placed under `(frontend)`, **not** `(payload)`, because everything under `src/app/(payload)/` is
Payload-generated and marked DO NOT MODIFY. Route groups do not affect URLs, so the path is
`/next/preview`. A matching `/next/exit-preview` disables draft mode.

Each global's `admin.livePreview.url` points at `/next/preview?secret=…&preview=<slug>`.

### Static rendering survives this

Verified in `node_modules/next/dist/docs/01-app/02-guides/draft-mode.md:12`: draft mode exists
precisely so static pages can switch to dynamic rendering without a rebuild. Enabling it sets a
`__prerender_bypass` cookie; only requests carrying that cookie bypass the static cache. Public
visitors keep the prerendered page.

This project does **not** enable `cacheComponents` (checked `next.config.ts`), so it uses Next
16's previous caching model, where `revalidatePath` in a route handler or hook is the correct
on-demand invalidation API.

### The GSAP problem — the highest-risk part of this work

`useLivePreview` re-renders the subscribed component on **every keystroke**. The animation set
pieces are not built for that: `Hero` splits its headline with `SplitText` and reverts the split
on completion (`Hero.tsx:31-53`), `Rooms` pins a horizontal ScrollTrigger track sized from
`scrollWidth` (`Rooms.tsx:28-42`), and `Experiences` builds a per-card ScrollTrigger chain
(`Experiences.tsx:24-39`). Re-running these mid-typing can leave the headline half-masked or
invisible, or leave a stale pin-spacer.

**Mitigation:** in preview mode the animations take the **existing `prefersReducedMotion()`
bail-out path** — static, fully visible content. Every animation entry point already checks that
guard and bails to fully visible content, so this reuses a code path that is already in place
and already exercised. The client sees their copy clearly while typing instead of fighting a
re-triggering intro. The published site is completely unaffected.

Implementation: a `PreviewContext` (or a prop threaded from the page) that makes the guard in
`src/lib/gsap.ts` return `true` when preview is active.

### Per-global preview

`useLivePreview` is built around a single document, but there are six globals. The preview URL
carries `?preview=<slug>`; a client bridge subscribes and patches **only** the section matching
that slug, while the other five keep their server-fetched data. This is the pragmatic shape and
should be built one global at a time, starting with `hero`, so the pattern is proven before it
is repeated.

## Publishing

An `afterChange` hook on each global calls `revalidatePath('/')`. The page is otherwise static.
`revalidatePath` must be imported in a server-only module; the hook runs inside the Payload
request, which satisfies that.

Publishing therefore appears on the live site within seconds, with no rebuild and no deploy hook.

## Seeding — `npm run seed`

A new idempotent script (`src/seed/index.ts`), added to `package.json` as
`"seed": "./scripts/with-db.sh cross-env NODE_OPTIONS=--no-deprecation payload run src/seed/index.ts"`
so it goes through the same Docker-lifecycle wrapper as every other DB-touching script. It:

1. Uploads the 14 client photographs from `public/images/` into `media`, with the `alt` text
   taken from the matching entry in today's `site.ts`.
2. Downloads and uploads the three Unsplash stock photos still in use (the stargazing
   experience, "Light through the pines", "A home-cooked spread") so all media is local. If a
   download fails, the script must fail with a clear message rather than leave a broken image.
3. Populates all six globals with exactly today's `site.ts` values, published.

Re-running must not duplicate media or clobber client edits — it checks for existing content and
skips. `public/images/` is kept as the originals and the seed source.

### Provenance is preserved, not lost

`AGENTS.md` requires every fact to record where it came from — the client's info sheet, a Google
Maps export, or a named third-party listing. Moving facts into a database would destroy those
JSDoc comments, so:

- **The seed file inherits the provenance comments verbatim** and becomes the written record of
  where each fact originated.
- **Editor-facing guidance moves into `admin.description`** on the relevant fields, where the
  person actually editing will see it — notably the tariff's "confirm current rates by phone
  before publishing, as these can change seasonally" (`site.ts:218-222`).

## `AGENTS.md` changes

Required in the same commit as the implementation, because the current text instructs future
agents to do the opposite of this design:

- Rewrite the rule "`src/lib/site.ts` is still the only source of truth for homestay facts. Do
  not treat a Payload collection as a second home for a price, phone number, or distance." It
  becomes: Payload owns hero, rooms, experiences, gallery, tariff, and all phone numbers;
  `site.ts` owns routes, testimonials, nav, map, and About copy.
- Document `npm run seed` alongside `npm run db:up` / `db:down`.
- Note the new `PREVIEW_SECRET` environment variable, which must be added to `.env` (and to
  whatever the deploy environment uses) — live preview silently fails without it.
- Record that preview mode intentionally disables animations, so nobody "fixes" it later.
- Keep the existing warnings about generated files, the `(payload)` route group, and
  `robots.ts`/`favicon.ico` staying at the app root — all still true.

## Verification

Per `AGENTS.md`, both must pass clean:

```bash
npm run lint
npm run build
```

Neither is optional; the build is what type-checks, and it will surface any prop-shape mismatch
between `payload-types.ts` and the components.

Additionally, because this touches layout-bearing components:

- **Regenerate types** with `npm run generate:types` after the globals exist. Never hand-edit
  `src/payload-types.ts`.
- **Manual responsive check** at desktop, laptop, tablet, and mobile widths via `npm run dev` —
  there is no automated responsive tooling in this project.
- **Admin smoke test per section:** edit → live preview updates → publish → change is live on
  `/`. Confirm the pinned Rooms scroll and the Experiences card stack still behave on the
  published page, since those are the two most animation-fragile sections.
- **Confirm `minRows: 1`** actually blocks removing the last room, experience, and gallery photo.
- **Confirm phone ordering:** reorder `bookingPhones`, republish, and check the header, the call
  pill, and the JSON-LD `telephone` all follow the new first entry.

## Known risk, out of scope

**Media uploads go to local disk.** Fine in development, but on most hosts a redeploy wipes
local uploads, which would break every client-uploaded image. Before launch this needs either a
persistent volume or a storage adapter (S3, UploadThing). Flagged here so it is not a surprise
at deploy time; it is not part of this work.
