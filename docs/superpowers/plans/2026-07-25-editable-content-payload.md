# Editable Site Content in Payload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the client edit the Hero, Rooms, Experiences, Gallery, Tariff sections and every phone number on the site from the Payload admin at `/admin`, with side-by-side Live Preview and draft/publish.

**Architecture:** Six Payload globals (`hero`, `rooms`, `experiences`, `gallery`, `tariff`, `site-settings`), each with `versions.drafts` and `admin.livePreview`. Repeatable cards are `array` fields with `minRows: 1` inside their section global. `src/app/(frontend)/page.tsx` becomes an async server component that fetches all six through a cached server-only layer (`src/lib/content.ts`) and passes them as props into the section components. The page stays statically prerendered; an `afterChange` hook calls `revalidatePath('/')` on publish, and Next's draft mode bypasses the static cache for preview only.

**Tech Stack:** Payload 3.86.0, `@payloadcms/db-postgres` 3.86.0, `@payloadcms/live-preview-react` 3.86.0 (to be installed), Next.js 16.2.6 (App Router, Turbopack), React 19.2.6, Tailwind v4, GSAP 3.15.

**Spec:** `docs/superpowers/specs/2026-07-25-editable-content-payload-design.md`

---

## Global Constraints

- **There is no unit test suite in this project, and this plan does not add one.** `AGENTS.md` states the build (which type-checks) and lint are the only automated signal. Every task's verification is therefore `npm run lint` + `npm run build` plus the explicit manual checks written into that task. **Do not scaffold Jest/Vitest/node:test** — that is scope the user did not ask for.
- **`npm run dev` and `npm run build` both require Docker running.** Both are wrapped in `scripts/with-db.sh`, which starts Postgres on host port 5433 and stops it on exit. Use `npm run db:up` / `npm run db:down` to hold the container up across several commands.
- **Both `npm run lint` and `npm run build` must pass clean before any commit.**
- **Never hand-edit `src/payload-types.ts` or `src/app/(payload)/admin/importMap.js`.** Regenerate with `npm run generate:types` and `npm run generate:importmap`.
- **Never modify anything under `src/app/(payload)/`** — it is Payload-generated and marked DO NOT MODIFY.
- **`src/app/robots.ts` and `src/app/favicon.ico` stay at the `src/app/` root.** Next anchors their metadata regexes to the app root; a route-group prefix 404s both with no build error.
- **Palette tokens only:** Ink Black `#021C1B`, `teal` `#82C4A1`, `celadon` `#AED9C2`, `cream` `#D5EBE0`, plus `ink-soft`, `ink-line`, `cream-dim`, `dawn`. **No warm/orange accents** — the client rejected an earlier ember/amber palette.
- **Fonts:** Fraunces (display), Manrope (body), Space Grotesk via `.font-numeric` — used for **every number on the site**: phone numbers, prices, coordinates, distances. Any new number-bearing markup gets `font-numeric`.
- **Section numbering 01–07 stays in code.** `SectionHeading`'s `index` and `label` props come from `NAV_LINKS` in `src/lib/site.ts`, not from Payload. Only section *titles* become editable.
- **Do not change the hero image default** (`hero-kanchenjunga.jpg`) — it stays the seeded value.
- **Every animation entry point must keep checking `prefersReducedMotion()`** and bail to static, fully visible content.
- **Provenance rule from `AGENTS.md`:** every homestay fact records where it came from. Facts moving into Payload keep their provenance in `src/seed/` comments; editor-facing guidance goes into `admin.description`.

---

## File Structure

**Create:**

| Path | Responsibility |
|---|---|
| `src/globals/revalidateHome.ts` | Shared `afterChange` hook — regenerates `/` on publish |
| `src/globals/Hero.ts` | `hero` global config |
| `src/globals/Rooms.ts` | `rooms` global config |
| `src/globals/Experiences.ts` | `experiences` global config |
| `src/globals/Gallery.ts` | `gallery` global config |
| `src/globals/Tariff.ts` | `tariff` global config |
| `src/globals/SiteSettings.ts` | `site-settings` global config |
| `src/globals/livePreview.ts` | Shared `admin.livePreview` builder |
| `src/lib/emphasis.tsx` | `renderEmphasis()` — `*word*` → `<em className="text-celadon">` |
| `src/lib/phone.ts` | `telHref()`, `validatePhone()` |
| `src/lib/gallery-layout.ts` | `galleryCell()` — mosaic slot derivation, panorama last |
| `src/lib/media.ts` | `mediaProps()` — populated upload → `{ src, alt }` |
| `src/lib/content.ts` | Server-only cached global fetchers |
| `src/lib/useSectionPreview.ts` | Client hook — merges Live Preview data for the active section |
| `src/app/(frontend)/next/preview/route.ts` | Validates secret, enables draft mode |
| `src/app/(frontend)/next/exit-preview/route.ts` | Disables draft mode |
| `src/seed/media.ts` | Idempotent image upload into `media` |
| `src/seed/index.ts` | Seeds all six globals from today's `site.ts` values |

**Modify:**

| Path | Change |
|---|---|
| `src/payload.config.ts:33` | Register six globals, add `serverURL` |
| `src/lib/gsap.ts:13-18` | `prefersReducedMotion()` also returns true inside the preview iframe |
| `src/lib/site.ts` | Remove the ten migrated exports (Task 10 only) |
| `src/components/Hero.tsx` | Take props |
| `src/components/Rooms.tsx` | Take props |
| `src/components/Experiences.tsx` | Take props |
| `src/components/Gallery.tsx` | Take props, add `"use client"` |
| `src/components/Tariff.tsx` | Take props, add `"use client"` |
| `src/components/Nav.tsx:91,151` | Take `phones` prop |
| `src/components/CallPill.tsx:28` | Take `phone` prop |
| `src/components/Footer.tsx:120,136,155` | Take `settings` prop |
| `src/components/GettingHere.tsx:61-64` | Take `transport` prop |
| `src/app/(frontend)/page.tsx` | Async, fetches all globals |
| `src/app/(frontend)/layout.tsx:3,84-101` | Async, JSON-LD from `site-settings` + `tariff` |
| `package.json` | Add `@payloadcms/live-preview-react`, `seed` script |
| `.env` | Add `PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL` |
| `AGENTS.md` | Rewrite the source-of-truth rule (Task 10) |

---

## Task 1: Shared plumbing and pure helpers

Pure functions and config with no consumers yet. Nothing renders differently at the end of this task — that is intentional, it keeps the risky parts isolated.

**Files:**
- Create: `src/lib/emphasis.tsx`, `src/lib/phone.ts`, `src/lib/gallery-layout.ts`, `src/lib/media.ts`, `src/globals/revalidateHome.ts`, `src/globals/livePreview.ts`
- Modify: `package.json`, `.env`, `src/lib/gsap.ts:13-18`

**Interfaces:**
- Produces:
  - `renderEmphasis(text: string): ReactNode`
  - `telHref(number: string): string`
  - `validatePhone(value: string | null | undefined): string | true`
  - `galleryCell(index: number, total: number): GalleryCell` where `GalleryCell = { span: string; height: string; speed: number }`
  - `mediaProps(value: unknown, context: string): { src: string; alt: string }`
  - `revalidateHome` — a global `afterChange` hook
  - `livePreviewFor(slug: string): LivePreviewConfig`

- [ ] **Step 1: Install the Live Preview package and add env vars**

```bash
npm install @payloadcms/live-preview-react@3.86.0
```

Append to `.env` (generate a real random secret, do not use the literal below):

```
PREVIEW_SECRET=<output of: openssl rand -hex 32>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

- [ ] **Step 2: Create `src/lib/emphasis.tsx`**

```tsx
import type { ReactNode } from "react";

/**
 * Section titles are plain text in Payload, where *asterisks* mark the word
 * rendered in the celadon accent — e.g. "All of them face *east*." This keeps
 * one italic word from requiring a whole rich-text editor.
 */
export function renderEmphasis(text: string): ReactNode {
  const pattern = /\*([^*]+)\*/g;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <em key={match.index} className="text-celadon">
        {match[1]}
      </em>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
```

- [ ] **Step 3: Create `src/lib/phone.ts`**

```ts
/**
 * Only the display form of a phone number is stored in Payload; the tel: link
 * is derived so the two can never drift apart.
 * "+91 98006 37784" -> "tel:+919800637784"
 */
export function telHref(number: string): string {
  const digits = number.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
}

/**
 * Deliberately permissive: Indian numbers are written many ways, and an
 * over-strict regex would block a legitimate edit by the client.
 */
export function validatePhone(value: string | null | undefined): string | true {
  if (!value) return "A phone number is required.";
  if (value.replace(/\D/g, "").length < 10) {
    return "Enter the full number including the country or area code (at least 10 digits).";
  }
  return true;
}
```

- [ ] **Step 4: Create `src/lib/gallery-layout.ts`**

```ts
export type GalleryCell = { span: string; height: string; speed: number };

/**
 * The gallery mosaic used to be a fixed six-slot array indexed with
 * `i % LAYOUT.length`. Now that the client can add photos, that would wrap a
 * seventh photo into the first slot and silently lose the full-bleed panorama
 * the last slot exists for. So the last photo always gets the panorama and
 * everything before it cycles the remaining five shapes.
 */
const PANORAMA: GalleryCell = {
  span: "sm:col-span-12",
  height: "h-[38vh] sm:h-[62vh]",
  speed: 9,
};

const CYCLE: GalleryCell[] = [
  { span: "sm:col-span-7", height: "h-[38vh] sm:h-[56vh]", speed: 6 },
  { span: "sm:col-span-5", height: "h-[38vh] sm:h-[56vh]", speed: 10 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 8 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 12 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 7 },
];

export function galleryCell(index: number, total: number): GalleryCell {
  if (index === total - 1) return PANORAMA;
  return CYCLE[index % CYCLE.length];
}
```

With the current six photos this returns exactly today's layout: indices 0–4 map to `CYCLE[0..4]`, index 5 to `PANORAMA`.

- [ ] **Step 5: Create `src/lib/media.ts`**

```ts
/**
 * Uploads arrive from Payload as a populated object when queried with
 * depth >= 1, or as a bare numeric id when not. Alt text lives on the Media
 * document itself (Media requires it), so it is never duplicated per usage.
 */
export function mediaProps(
  value: unknown,
  context: string
): { src: string; alt: string } {
  if (!value || typeof value !== "object") {
    throw new Error(
      `${context}: image is not populated. Fetch the global with depth: 1.`
    );
  }
  const media = value as { url?: string | null; alt?: string | null };
  if (!media.url) {
    throw new Error(`${context}: image has no url.`);
  }
  return { src: media.url, alt: media.alt ?? "" };
}
```

- [ ] **Step 6: Create `src/globals/revalidateHome.ts`**

```ts
import { revalidatePath } from "next/cache";
import type { GlobalConfig } from "payload";

type AfterChangeHook = NonNullable<
  NonNullable<GlobalConfig["hooks"]>["afterChange"]
>[number];

/**
 * The homepage is statically prerendered, so publishing has to invalidate it.
 *
 * Two guards matter here. `context.disableRevalidate` lets the seed script
 * write globals without this firing. The try/catch covers calls that happen
 * outside a Next request scope (seeding, build-time writes), where
 * revalidatePath throws rather than no-oping.
 */
export const revalidateHome: AfterChangeHook = ({ context, doc, req }) => {
  if (context?.disableRevalidate) return doc;

  try {
    revalidatePath("/");
  } catch (error) {
    req.payload.logger.warn(
      `revalidatePath('/') skipped: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return doc;
};
```

- [ ] **Step 7: Create `src/globals/livePreview.ts`**

```ts
import type { LivePreviewConfig } from "payload";

/**
 * Points the admin's preview iframe at the homepage through the preview route,
 * which validates the secret and enables Next draft mode. The `preview` param
 * tells the frontend which section is being edited — only that one consumes
 * live keystroke data.
 */
export function livePreviewFor(slug: string): LivePreviewConfig {
  return {
    openByDefault: true,
    url: () => {
      const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
      const secret = process.env.PREVIEW_SECRET ?? "";
      return `${base}/next/preview?secret=${encodeURIComponent(
        secret
      )}&preview=${encodeURIComponent(slug)}`;
    },
  };
}
```

- [ ] **Step 8: Make `prefersReducedMotion()` preview-aware**

Replace `src/lib/gsap.ts:9-18` with:

```ts
/**
 * True inside Payload's Live Preview iframe. Live Preview re-renders on every
 * keystroke, which re-splits the hero headline and rebuilds ScrollTriggers
 * mid-animation — leaving text half-masked or invisible while the client
 * types. Taking the reduced-motion path there shows stable, fully visible
 * content. The published site is unaffected.
 *
 * Detected synchronously from the frame + query string so it needs no
 * provider and no effect-ordering guarantees.
 */
function isLivePreview() {
  return (
    window.self !== window.top &&
    new URLSearchParams(window.location.search).has("preview")
  );
}

/**
 * Every animation entry point checks this and bails, leaving content fully
 * visible and static — GSAP effects are progressive enhancement only.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  if (isLivePreview()) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

- [ ] **Step 9: Verify**

```bash
npm run lint
npm run build
```

Expected: both clean. Nothing renders differently yet — the build output should still show `○ /` (static).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json src/lib/emphasis.tsx src/lib/phone.ts src/lib/gallery-layout.ts src/lib/media.ts src/globals/revalidateHome.ts src/globals/livePreview.ts src/lib/gsap.ts
git commit -m "Add shared helpers for Payload-driven content

Pure helpers for title emphasis, tel: links, gallery mosaic slots and
populated uploads, plus the shared revalidate hook and live preview config.
prefersReducedMotion now also bails inside the preview iframe, where
per-keystroke re-renders break SplitText and ScrollTrigger."
```

Note: `.env` is not committed. Tell the user both new variables must be set.

---

## Task 2: Media seeding

Every image-bearing global needs Media documents to point at, so this comes before any of them.

**Files:**
- Create: `src/seed/media.ts`
- Modify: `package.json` (add `seed` script)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `seedMedia(payload: Payload): Promise<Record<string, number>>` — a map from source key (e.g. `"four-occupancy.jpeg"`, `"stargazing"`) to the created Media document id.

- [ ] **Step 1: Add the seed script to `package.json`**

Add to `"scripts"`:

```json
"seed": "./scripts/with-db.sh cross-env NODE_OPTIONS=--no-deprecation payload run src/seed/index.ts"
```

`payload run` is a real command in 3.86.0 (`node_modules/payload/dist/bin/index.js:61`) and loads the Payload config and env for a one-off script.

- [ ] **Step 2: Create `src/seed/media.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";
import type { Payload } from "payload";

/**
 * Alt text for the client's own photographs, carried over verbatim from the
 * imageAlt fields in src/lib/site.ts as of 2026-07-25. Provenance: the
 * client's own photographs, supplied with the info sheet, stored in
 * public/images and named for where they belong.
 */
const LOCAL_IMAGES: { file: string; alt: string }[] = [
  {
    file: "hero-kanchenjunga.jpg",
    alt: "The Kanchenjunga range catching first light at sunrise",
  },
  {
    file: "four-occupancy.jpeg",
    alt: "A four-sharing room with two double beds under a wood-panelled ceiling, windows opening to the valley",
  },
  {
    file: "six-person-occupancy.jpeg",
    alt: "A spacious six-sharing room with three beds and wide windows framing the mountains",
  },
  {
    file: "Tent.jpeg",
    alt: "Tents pitched on the open ridge with the snow peaks of the range on the horizon",
  },
  {
    file: "Sunrise.jpg",
    alt: "The sun rising beside the homestay, camping tents and prayer flags on the ridge in the morning light",
  },
  {
    file: "NamthingPokhari.jpg",
    alt: "Namthing Pokhari lake ringed by pine forest in the monsoon rain, a tall Hanuman statue and saffron flags on its bank",
  },
  {
    file: "BirdinginLatpanchar.jpg",
    alt: "A yellow-and-green sunbird feeding on orange flowers in the forest",
  },
  {
    file: "SittongOraneOrchards.jpg",
    alt: "Ripe oranges hanging among dark green leaves on the tree",
  },
  {
    file: "teestariverfromtop.jpg",
    alt: "The emerald-green Teesta river winding through the forested valley far below",
  },
  {
    file: "morningontheridge.jpg",
    alt: "Visitors on the grassy ridgeline above a sea of clouds at dawn",
  },
  {
    file: "Thehighrangecleardayview.jpg",
    alt: "The snow-capped high range across the hills, seen from a tent doorway on a clear day",
  },
  {
    file: "teafromthehills.jpg",
    alt: "A glass cup of amber tea held up against a misty, tea-covered hillside",
  },
  {
    file: "firstlightoverthehills.jpg",
    alt: "Tents on a tea-covered ridge at dawn, distant snow peaks catching first light over rolling hills",
  },
  {
    file: "the-homestay.jpg",
    alt: "The homestay building on the ridge among tea bushes",
  },
];

/**
 * Curated Unsplash stock still standing in for photos the client has not
 * supplied yet — the stargazing experience and two gallery captions. These are
 * downloaded once into Media so all images are served locally. Swap them for
 * real photographs when they arrive.
 */
const REMOTE_IMAGES: { key: string; url: string; filename: string; alt: string }[] = [
  {
    key: "stargazing",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1600&auto=format&fit=crop",
    filename: "stargazing.jpg",
    alt: "The Milky Way over a dark mountain silhouette",
  },
  {
    key: "pines",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1800&auto=format&fit=crop",
    filename: "light-through-the-pines.jpg",
    alt: "Morning light through pine forest",
  },
  {
    key: "spread",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1800&auto=format&fit=crop",
    filename: "home-cooked-spread.jpg",
    alt: "Curries and rice served in steel bowls, home-style",
  },
];

async function findOrCreate(
  payload: Payload,
  filename: string,
  alt: string,
  data: Buffer,
  mimetype: string
): Promise<number> {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    pagination: false,
  });

  const found = existing.docs[0];
  if (found) {
    payload.logger.info(`media: reusing ${filename}`);
    return found.id as number;
  }

  const created = await payload.create({
    collection: "media",
    data: { alt },
    file: { name: filename, data, mimetype, size: data.byteLength },
    context: { disableRevalidate: true },
  });

  payload.logger.info(`media: uploaded ${filename}`);
  return created.id as number;
}

function mimeFor(filename: string): string {
  return filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
}

/**
 * Idempotent: existing media is reused by filename, never duplicated, and
 * never overwritten — so re-running the seed cannot clobber a client upload.
 */
export async function seedMedia(payload: Payload): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  const imagesDir = path.resolve(process.cwd(), "public/images");

  for (const { file, alt } of LOCAL_IMAGES) {
    const data = await fs.readFile(path.join(imagesDir, file));
    ids[file] = await findOrCreate(payload, file, alt, data, mimeFor(file));
  }

  for (const { key, url, filename, alt } of REMOTE_IMAGES) {
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: filename } },
      limit: 1,
      pagination: false,
    });

    if (existing.docs[0]) {
      ids[key] = existing.docs[0].id as number;
      payload.logger.info(`media: reusing ${filename}`);
      continue;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download stock photo ${filename} (${response.status} ${response.statusText}). ` +
          `Check the URL in src/seed/media.ts or supply a real photograph instead.`
      );
    }
    const data = Buffer.from(await response.arrayBuffer());
    ids[key] = await findOrCreate(payload, filename, alt, data, "image/jpeg");
  }

  return ids;
}
```

- [ ] **Step 3: Create a temporary entry point so this task is verifiable**

Create `src/seed/index.ts` with only the media step for now. Task 3 onward will extend it.

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import { seedMedia } from "./media";

async function seed() {
  const payload = await getPayload({ config });
  const media = await seedMedia(payload);
  payload.logger.info(`seed: ${Object.keys(media).length} media documents ready`);
  process.exit(0);
}

await seed();
```

- [ ] **Step 4: Run the seed and verify**

```bash
npm run lint
npm run seed
```

Expected: 17 lines of `media: uploaded …`, then `seed: 17 media documents ready`.

Run it a second time. Expected: 17 lines of `media: reusing …` and no duplicates — this proves idempotency.

- [ ] **Step 5: Verify in the admin**

```bash
npm run db:up && npm run dev
```

Visit `http://localhost:3000/admin/collections/media`. Confirm 17 documents, each with a thumbnail and non-empty alt text. Confirm `hero-kanchenjunga.jpg` is among them.

- [ ] **Step 6: Build, then commit**

```bash
npm run build
git add package.json src/seed/media.ts src/seed/index.ts
git commit -m "Add idempotent media seeding

Uploads the client's 14 photographs plus the 3 remaining Unsplash stand-ins
into the media collection, reusing by filename so a re-run never duplicates
or clobbers a client upload. Alt text carried over verbatim from site.ts."
```

---

## Task 3: `site-settings` global and every phone number

Delivers the phone requirement end to end across all eight render sites.

**Files:**
- Create: `src/globals/SiteSettings.ts`
- Modify: `src/payload.config.ts`, `src/seed/index.ts`, `src/lib/content.ts` (create), `src/components/Nav.tsx`, `src/components/CallPill.tsx`, `src/components/Footer.tsx`, `src/components/GettingHere.tsx`, `src/components/Tariff.tsx`, `src/app/(frontend)/page.tsx`, `src/app/(frontend)/layout.tsx`

**Interfaces:**
- Consumes: `telHref`, `validatePhone` (Task 1); `revalidateHome`, `livePreviewFor` (Task 1).
- Produces: `getSiteSettings(draft: boolean)` from `src/lib/content.ts`, returning the populated `site-settings` global.

- [ ] **Step 1: Create `src/globals/SiteSettings.ts`**

```ts
import type { GlobalConfig } from "payload";
import { validatePhone } from "@/lib/phone";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Contact & Site Info",
  admin: {
    group: "Settings",
    livePreview: livePreviewFor("site-settings"),
  },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "bookingPhones",
      type: "array",
      label: "Booking phone numbers",
      minRows: 1,
      maxRows: 4,
      required: true,
      admin: {
        description:
          "The FIRST number in this list is the one shown in the site header, the floating call button, and Google's search listing. Drag to reorder.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: { description: 'For example "Bookings" or "Bookings (alt.)".' },
        },
        {
          name: "number",
          type: "text",
          required: true,
          validate: validatePhone,
          admin: {
            description:
              "Write it the way it should appear, e.g. +91 98006 37784. The tap-to-call link is generated automatically.",
          },
        },
      ],
    },
    {
      name: "transportName",
      type: "text",
      label: "Transport contact name",
      required: true,
      admin: {
        description:
          "The local driver shown in Getting Here and the footer — not the homestay itself.",
      },
    },
    {
      name: "transportPhones",
      type: "array",
      label: "Transport phone numbers",
      minRows: 1,
      required: true,
      fields: [
        { name: "number", type: "text", required: true, validate: validatePhone },
      ],
    },
    {
      name: "coordinates",
      type: "text",
      required: true,
      admin: {
        description:
          'Shown in the hero and footer, and parsed into the site\'s map metadata for Google. Keep the format "26.9369° N, 88.4039° E".',
      },
    },
    {
      name: "altitude",
      type: "text",
      required: true,
      admin: {
        description:
          'Approximate values keep the "≈" prefix rather than presenting a guess as certain.',
      },
    },
    { name: "region", type: "text", required: true },
    {
      name: "address",
      type: "textarea",
      required: true,
      admin: { description: "Shown in the footer and in the site's search-engine metadata." },
    },
  ],
};
```

- [ ] **Step 2: Register it in `src/payload.config.ts`**

Add the import and replace the `plugins: []` line region so the config reads:

```ts
import { SiteSettings } from './globals/SiteSettings'
```

and inside `buildConfig({...})`:

```ts
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  collections: [Users, Media],
  globals: [SiteSettings],
```

Keep `plugins: []` as it is.

- [ ] **Step 3: Regenerate types**

```bash
npm run generate:types
```

Then **open `src/payload-types.ts` and read the generated type name for the `site-settings` global.** Payload singularises slugs, so it is most likely `SiteSetting`, but use whatever is actually generated — do not guess. Every later task depends on this name.

- [ ] **Step 4: Create `src/lib/content.ts`**

```ts
import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

function assertPopulated(value: unknown, slug: string): void {
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Payload global "${slug}" has no content. Run \`npm run seed\` to populate it from src/lib/site.ts.`
    );
  }
}

/**
 * depth: 1 populates upload relationships with their url and alt.
 * overrideAccess is only needed for draft reads, which happen behind the
 * preview secret.
 */
export const getSiteSettings = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "site-settings",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  assertPopulated(doc.bookingPhones?.[0]?.number, "site-settings");
  return doc;
});
```

- [ ] **Step 5: Extend `src/seed/index.ts`**

Replace the file with:

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import { seedMedia } from "./media";
import { seedSiteSettings } from "./siteSettings";

async function seed() {
  const payload = await getPayload({ config });
  const media = await seedMedia(payload);
  payload.logger.info(`seed: ${Object.keys(media).length} media documents ready`);
  await seedSiteSettings(payload);
  payload.logger.info("seed: done");
  process.exit(0);
}

await seed();
```

Create `src/seed/siteSettings.ts`:

```ts
import type { Payload } from "payload";

/**
 * Values carried over verbatim from CONTACT, TRANSPORT_CONTACT and META in
 * src/lib/site.ts as of 2026-07-25.
 *
 * Provenance: the homestay's own info sheet ("Sunrise Viewpoint Homestay.md",
 * provided by the client). The altitude keeps its "≈" because it could not be
 * verified exactly.
 */
export async function seedSiteSettings(payload: Payload): Promise<void> {
  const existing = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  if (existing?.bookingPhones?.length) {
    payload.logger.info("seed: site-settings already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      bookingPhones: [
        { label: "Bookings", number: "+91 98006 37784" },
        { label: "Bookings (alt.)", number: "+91 70195 92753" },
      ],
      transportName: "Gopal Chhetri",
      transportPhones: [
        { number: "+91 94746 80915" },
        { number: "+91 89186 78841" },
      ],
      coordinates: "26.9369° N, 88.4039° E",
      altitude: "≈ 4,200 ft",
      region: "Aahal Dara, Sittong III · Darjeeling Hills",
      address:
        "Aahal Dara, Sittong III, Kurseong, Darjeeling District, West Bengal 734008",
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: site-settings populated");
}
```

- [ ] **Step 6: Run the seed**

```bash
npm run seed
```

Expected: media reused, then `seed: site-settings populated`. Run again; expect `site-settings already populated, skipping`.

- [ ] **Step 7: Thread settings through the components**

Every component below imports the generated global type directly — **no alias**, so the name is the same in every file and every later task:

```ts
import type { SiteSetting } from "@/payload-types";
```

Substitute whatever name you actually found in Step 3 for `SiteSetting`, consistently, everywhere. Where a field is an optional array, the prop type is `NonNullable<SiteSetting["bookingPhones"]>` so components don't each re-handle null.

Now make these edits. In each case the phone's `href` comes from `telHref(phone.number)` — **delete every reference to a stored `href`**.

**`src/components/Nav.tsx`** — add to its props type `phones: NonNullable<SiteSetting["bookingPhones"]>`, and at lines 91/94 and 151/155 replace `CONTACT.phones[0].href` with `telHref(phones![0].number)` and `CONTACT.phones[0].number` with `phones![0].number`. Remove `CONTACT` from the `site.ts` import, keeping `NAV_LINKS`.

**`src/components/CallPill.tsx`** — add prop `phone: { number: string }`, replace `CONTACT.phones[0].href` at line 28 with `telHref(phone.number)`, and drop the `CONTACT` import.

**`src/components/Footer.tsx`** — add prop `settings: SiteSetting`. Replace `CONTACT.phones` at line 120 with `settings.bookingPhones`, `TRANSPORT_CONTACT.name` at 136 with `settings.transportName`, `TRANSPORT_CONTACT.phones` at 138 with `settings.transportPhones`, `CONTACT.address` at 155 with `settings.address`, and every `META.*` with `settings.*`. Keep `GOOGLE_REVIEWS` coming from `site.ts`.

**`src/components/GettingHere.tsx`** — add prop `transport: { name: string; phones: { number: string }[] }` built by the caller from `settings`, and replace `TRANSPORT_CONTACT` usage at lines 61 and 64. Keep `ROUTES`, `MAP_EMBED_SRC` and `MAP_DIRECTIONS_URL` from `site.ts`.

**`src/components/Tariff.tsx`** — add prop `phones: NonNullable<SiteSetting["bookingPhones"]>` and replace `CONTACT.phones` at line 141 with it, using `telHref(phone.number)` for the `href`. Everything else in Tariff still comes from `site.ts` at this point; Task 9 finishes it.

**`src/components/Hero.tsx`** — replace the three `META.*` reads at lines 120–124 with a new `meta` prop: `meta: Pick<SiteSetting, "coordinates" | "altitude" | "region">`. Drop the `site.ts` import.

- [ ] **Step 8: Wire `page.tsx`**

```tsx
export default async function Home() {
  const { isEnabled: draft } = await draftMode();
  const settings = await getSiteSettings(draft);

  return (
    <>
      <SmoothScroll />
      {/* skip link unchanged */}
      <Nav phones={settings.bookingPhones} />
      <main id="main">
        <Hero meta={settings} />
        <Marquee />
        <About />
        <Rooms />
        <Experiences />
        <Gallery />
        <Tariff phones={settings.bookingPhones} />
        <Testimonials />
        <GettingHere
          transport={{
            name: settings.transportName,
            phones: settings.transportPhones ?? [],
          }}
        />
      </main>
      <Footer settings={settings} />
      <CallPill phone={settings.bookingPhones![0]} />
    </>
  );
}
```

Add `import { draftMode } from "next/headers"` and `import { getSiteSettings } from "@/lib/content"`.

- [ ] **Step 9: Wire `layout.tsx`**

Make the default export `async`. Replace the `site.ts` import at line 3 with `import { SITE_URL } from "@/lib/site"` plus `getSiteSettings`, and fetch:

```tsx
const { isEnabled: draft } = await draftMode();
const settings = await getSiteSettings(draft);
const coordParts = settings.coordinates.match(/[\d.]+/g) || [];
```

Replace `CONTACT.phones[0].number` at line 101 with `settings.bookingPhones![0].number`, and use `settings.address` for the `PostalAddress` `streetAddress`. **Leave the `TARIFF`-derived `priceRange` block at lines 88–93 alone for now** — Task 9 replaces it.

- [ ] **Step 10: Verify**

```bash
npm run lint
npm run build
```

Expected: both clean, and the build output still shows `○ /` — confirming `draftMode()` did **not** force the page dynamic. **If `/` has become `ƒ` (dynamic), stop and investigate before continuing** — the whole caching strategy depends on this.

Then `npm run dev` and check in the browser:
- Header call button, floating call pill, Reserve band, footer, and Getting Here all show the correct numbers.
- Tapping a number produces a working `tel:` link (inspect the `href`).
- View source and confirm the JSON-LD `telephone` is `+91 98006 37784`.

- [ ] **Step 11: Verify phone ordering, which is the subtle requirement**

In `/admin/globals/site-settings`, drag "Bookings (alt.)" above "Bookings" and publish. Reload `/` and confirm the header, the call pill, and the JSON-LD `telephone` **all** now show `+91 70195 92753`. Then drag it back and republish.

- [ ] **Step 12: Commit**

```bash
git add src/globals/SiteSettings.ts src/payload.config.ts src/payload-types.ts src/lib/content.ts src/seed/index.ts src/seed/siteSettings.ts src/components/Nav.tsx src/components/CallPill.tsx src/components/Footer.tsx src/components/GettingHere.tsx src/components/Tariff.tsx src/components/Hero.tsx "src/app/(frontend)/page.tsx" "src/app/(frontend)/layout.tsx"
git commit -m "Make every phone number and site meta editable in Payload

Adds the site-settings global covering both phone groups (the homestay's
booking numbers and the local driver's), coordinates, altitude, region and
address, and threads it through all eight render sites. tel: links are now
derived from the display number so the two cannot drift apart."
```

---

## Task 4: `hero` global

**Files:**
- Create: `src/globals/Hero.ts`, `src/seed/hero.ts`
- Modify: `src/payload.config.ts`, `src/lib/content.ts`, `src/seed/index.ts`, `src/components/Hero.tsx`, `src/app/(frontend)/page.tsx`

**Interfaces:**
- Consumes: `mediaProps` (Task 1), `getSiteSettings` (Task 3).
- Produces: `getHero(draft: boolean)`.

- [ ] **Step 1: Create `src/globals/Hero.ts`**

```ts
import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Hero: GlobalConfig = {
  slug: "hero",
  label: "Hero",
  admin: { group: "Content", livePreview: livePreviewFor("hero") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "The full-screen opening photograph. Use a wide landscape — it is cropped to fill the whole screen on every device.",
      },
    },
    {
      name: "headlineLine1",
      type: "text",
      required: true,
      admin: { description: "First line of the big headline, e.g. Sunrise" },
    },
    {
      name: "headlineLine2",
      type: "text",
      required: true,
      admin: { description: "Second line of the big headline, e.g. Viewpoint" },
    },
    {
      name: "headlineAccent",
      type: "text",
      maxLength: 2,
      admin: {
        description:
          "A one-character flourish shown in teal after the headline, normally a full stop. Leave empty for none.",
      },
    },
    { name: "subhead", type: "textarea", required: true },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      admin: {
        description:
          "Text on the button, e.g. Call to book. The button always jumps to the Tariff section.",
      },
    },
  ],
};
```

- [ ] **Step 2: Register in `src/payload.config.ts`**

```ts
globals: [Hero, SiteSettings],
```

Then `npm run generate:types`.

- [ ] **Step 3: Add `getHero` to `src/lib/content.ts`**

```ts
export const getHero = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "hero",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  assertPopulated(doc.headlineLine1, "hero");
  return doc;
});
```

- [ ] **Step 4: Create `src/seed/hero.ts`**

```ts
import type { Payload } from "payload";

/**
 * Copy carried over verbatim from src/components/Hero.tsx as of 2026-07-25.
 * Provenance: the client's own info sheet. The backdrop is the client's own
 * photograph — do not change this default.
 */
export async function seedHero(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "hero", depth: 0 });
  if (existing?.headlineLine1) {
    payload.logger.info("seed: hero already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "hero",
    data: {
      backgroundImage: media["hero-kanchenjunga.jpg"],
      headlineLine1: "Sunrise",
      headlineLine2: "Viewpoint",
      headlineAccent: ".",
      subhead:
        "A family-run homestay on the Aahaldara ridge, with a 180° sunrise view of the Kanchenjunga range and the Teesta valley far below.",
      ctaLabel: "Call to book",
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: hero populated");
}
```

Call it from `src/seed/index.ts` after `seedSiteSettings`, passing `media`.

- [ ] **Step 5: Convert `src/components/Hero.tsx` to props**

Add above the component:

```tsx
import { mediaProps } from "@/lib/media";
import type { Hero as HeroData, SiteSetting } from "@/payload-types";

type HeroProps = {
  data: HeroData;
  meta: Pick<SiteSetting, "coordinates" | "altitude" | "region">;
};
```

Change the signature to `export default function Hero({ data, meta }: HeroProps)`, then inside:

```tsx
const backdrop = mediaProps(data.backgroundImage, "hero.backgroundImage");
```

Replace the `<Image>` at lines 107–114 `src`/`alt` with `src={backdrop.src}` and `alt={backdrop.alt}`, keeping `fill`, `priority`, `sizes="100vw"` and the `hero-img object-cover` class exactly as they are.

Replace the `<h1>` body at lines 128–131 with:

```tsx
{data.headlineLine1}
<br />
{data.headlineLine2}
{data.headlineAccent ? <span className="text-teal">{data.headlineAccent}</span> : null}
```

Replace the subhead text at 135–136 with `{data.subhead}` and the button label at 142 with `{data.ctaLabel}`.

Leave every GSAP block, every class name, and the `href="#tariff"` untouched.

- [ ] **Step 6: Wire it in `page.tsx`**

```tsx
const [settings, hero] = await Promise.all([
  getSiteSettings(draft),
  getHero(draft),
]);
...
<Hero data={hero} meta={settings} />
```

- [ ] **Step 7: Verify**

```bash
npm run seed
npm run lint
npm run build
```

Expected: `seed: hero populated`, both commands clean, `/` still `○`.

Then `npm run dev` and confirm at `http://localhost:3000`:
- The hero looks **pixel-identical to before** — same photo, same two-line headline with the teal full stop, same subhead, same button.
- The headline intro animation still plays on load and the backdrop still parallaxes on scroll.

- [ ] **Step 8: Commit**

```bash
git add src/globals/Hero.ts src/seed/hero.ts src/seed/index.ts src/payload.config.ts src/payload-types.ts src/lib/content.ts src/components/Hero.tsx "src/app/(frontend)/page.tsx"
git commit -m "Make the hero section editable in Payload

Headline, accent, subhead, button label and backdrop photograph now come from
the hero global, seeded with the existing copy so the rendered output is
unchanged."
```

---

## Task 5: Live Preview, proven on the hero

The riskiest task. It stops here until the hero previews correctly, so the pattern is proven once before five more sections repeat it.

**Files:**
- Create: `src/app/(frontend)/next/preview/route.ts`, `src/app/(frontend)/next/exit-preview/route.ts`, `src/lib/useSectionPreview.ts`
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `getHero` (Task 4).
- Produces: `useSectionPreview<T>(slug: string, initialData: T): T`.

- [ ] **Step 1: Create `src/app/(frontend)/next/preview/route.ts`**

Placed under `(frontend)` because `src/app/(payload)/` is generated and must not be touched. Route groups do not affect URLs, so this serves `/next/preview`.

```ts
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const preview = request.nextUrl.searchParams.get("preview") ?? "";

  if (!process.env.PREVIEW_SECRET) {
    return new Response("PREVIEW_SECRET is not configured on the server.", {
      status: 500,
    });
  }
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid preview secret.", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/?preview=${encodeURIComponent(preview)}`);
}
```

`redirect()` signals by throwing, so it must stay outside any try/catch.

- [ ] **Step 2: Create `src/app/(frontend)/next/exit-preview/route.ts`**

```ts
import { draftMode } from "next/headers";

export async function GET() {
  const draft = await draftMode();
  draft.disable();
  return new Response("Draft mode disabled.");
}
```

- [ ] **Step 3: Create `src/lib/useSectionPreview.ts`**

```ts
"use client";

import { useEffect, useState } from "react";
import { useLivePreview } from "@payloadcms/live-preview-react";

/**
 * Payload's Live Preview posts the document being edited to the previewed
 * page. Because this site is one page fed by six globals, the preview URL
 * carries ?preview=<slug> and only the matching section consumes the live
 * data — every other section keeps its server-fetched props, which would
 * otherwise be overwritten with fields from a different global.
 */
export function useSectionPreview<T extends Record<string, any>>(
  slug: string,
  initialData: T
): T {
  const [isTarget, setIsTarget] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsTarget(params.get("preview") === slug);
  }, [slug]);

  const { data } = useLivePreview<T>({
    initialData,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "",
    depth: 1,
  });

  return isTarget ? data : initialData;
}
```

> **Correction applied during implementation (commit 4a3c9be).** Two defects in the code above were
> found and fixed while implementing this task:
> 1. The `?preview=<slug>` gate alone is **not sufficient**. `@payloadcms/live-preview` keeps one
>    module-level `previousData` shared by every subscriber and returns it for any non-data message,
>    including the `payload-document-event` the admin posts on save — so a second subscriber could be
>    handed a different global's document and crash. The gate must also assert
>    `data?.globalType === slug`. (`data.id` cannot be used: every global has `id: 1`.)
> 2. The `useEffect` + `setState` slug read fails lint — `eslint-config-next@16.2.6` ships
>    `react-hooks/set-state-in-effect` as an error. Use `useSyncExternalStore` with a `false` server
>    snapshot instead: same semantics, no hydration mismatch, still no server-side `searchParams`.
>
> 3. `serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? ""` **crashes the public homepage.**
>    `useLivePreview` calls `ready()` in its mount effect, which does `postMessage(msg, serverURL)`;
>    `""` is not a valid `targetOrigin`, so it throws a `SyntaxError` out of an effect and Next's
>    error boundary replaces the page — for every visitor, not just previewers. The env var is now
>    normalised once in `src/lib/preview.ts` (`new URL(raw).origin`, `null` when unset/invalid) and
>    both call sites use it: the client falls back to `window.location.origin`, the admin config to
>    `http://localhost:3000`.
> 4. **`isTarget` (the `?preview=<slug>` check) was dropped entirely.** `data.globalType === slug`
>    discriminates on a property of the payload itself, so the query-string check adds no protection
>    and is the only thing that can reject *valid* data — if the admin SPA-navigates between globals
>    without reloading the iframe, `?preview=hero` persists while `rooms` is edited and preview
>    silently stops updating. Dropping it removes `useSyncExternalStore` and the hydration reasoning
>    from the hook, so item 2 above no longer applies to the shipped code.
> 5. **Throwing helpers must not be reachable from preview form state.** Drafts skip required-field
>    validation, so clearing the hero upload posts `backgroundImage: null` on both the client
>    (keystroke data) and the server (draft render) — and `mediaProps` threw, killing the pane until
>    reload. An error boundary cannot fix this: the throw unmounts the subscriber, so the pane stays
>    dead. Instead the *purpose* of that throw — catching a forgotten `depth: 1` — moved to
>    `assertMediaPopulated` in `src/lib/content.ts`, which throws only when an upload arrives as a
>    bare id. `mediaProps` now returns a neutral ink placeholder for an empty field. **Tasks 6–9 need
>    no per-section handling for this**; they inherit it.
>
> See `src/lib/useSectionPreview.ts`, `src/lib/preview.ts`, `src/lib/media.ts` and
> `src/lib/content.ts` for the shipped versions.

- [ ] **Step 4: Subscribe the hero**

In `src/components/Hero.tsx`, add the import and replace the first line of the component body:

```tsx
import { useSectionPreview } from "@/lib/useSectionPreview";
// ...
export default function Hero({ data: initialData, meta }: HeroProps) {
  const data = useSectionPreview("hero", initialData);
```

Everything below stays as written in Task 4 — it already reads from `data`.

- [ ] **Step 5: Verify the guard rails before the happy path**

```bash
npm run lint
npm run build
```

Expected: clean, and `/` still `○` static. Reading `searchParams` in the page would have broken that; this design deliberately reads the preview slug client-side instead.

Then, with `npm run dev` running:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/next/preview?secret=wrong&preview=hero"
```

Expected: `401`.

- [ ] **Step 6: Verify Live Preview end to end**

Open `/admin/globals/hero`. Live Preview should open by default (`openByDefault: true`) with the real homepage in the right-hand iframe.

Confirm all four:
1. Editing **Headline line 1** updates the iframe **as you type**, without saving.
2. **The hero headline is fully visible and static in the iframe** — no half-masked or invisible text. This is the `prefersReducedMotion()` preview bail-out from Task 1 doing its job. If the text is animating or clipped, `isLivePreview()` is not detecting the frame; debug that before continuing.
3. Changing the **backdrop image** swaps the photo in the preview.
4. **Save as draft**, then open `/` in a normal tab: the published copy is still the old text. **Publish**, reload `/`: the new text appears within seconds, proving the `revalidateHome` hook works.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(frontend)/next" src/lib/useSectionPreview.ts src/components/Hero.tsx
git commit -m "Add Live Preview with per-section targeting

Preview route validates PREVIEW_SECRET and enables Next draft mode; the
preview slug is read client-side so the homepage stays statically
prerendered. Only the section named in ?preview= consumes live keystroke
data, so one global's fields can't overwrite another's."
```

---

## Task 6: `rooms` global

**Files:**
- Create: `src/globals/Rooms.ts`, `src/seed/rooms.ts`
- Modify: `src/payload.config.ts`, `src/lib/content.ts`, `src/seed/index.ts`, `src/components/Rooms.tsx`, `src/app/(frontend)/page.tsx`

**Interfaces:**
- Consumes: `mediaProps`, `renderEmphasis` (Task 1), `useSectionPreview` (Task 5).
- Produces: `getRooms(draft: boolean)`.

- [ ] **Step 1: Create `src/globals/Rooms.ts`**

```ts
import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Rooms: GlobalConfig = {
  slug: "rooms",
  label: "Rooms",
  admin: { group: "Content", livePreview: livePreviewFor("rooms") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          "Section heading. Wrap one word in *asterisks* to show it in the celadon accent, e.g. All of them face *east*. NOTE: this heading mentions how many rooms there are — update it if you add or remove a room below.",
      },
    },
    {
      name: "items",
      type: "array",
      label: "Room types",
      minRows: 1,
      required: true,
      labels: { singular: "Room type", plural: "Room types" },
      admin: {
        description:
          "At least one room type is required. Drag to reorder — this is the order guests scroll through.",
        initCollapsed: true,
      },
      fields: [
        { name: "name", type: "text", required: true, admin: { description: 'e.g. "4-Sharing Rooms"' } },
        { name: "count", type: "text", required: true, admin: { description: 'e.g. "6 rooms" or "pitched on request"' } },
        { name: "occupancy", type: "text", required: true, admin: { description: 'e.g. "up to 4 guests per room"' } },
        { name: "tagline", type: "textarea", required: true },
        {
          name: "features",
          type: "array",
          minRows: 1,
          required: true,
          labels: { singular: "Feature", plural: "Features" },
          admin: { description: "Short chips shown under the description." },
          fields: [{ name: "value", type: "text", required: true }],
        },
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
  ],
};
```

- [ ] **Step 2: Register, regenerate types, add the fetcher**

Add `Rooms` to `globals: [Hero, Rooms, SiteSettings]`, run `npm run generate:types`, then add to `src/lib/content.ts`:

```ts
export const getRooms = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "rooms",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  assertPopulated(doc.items?.[0]?.name, "rooms");
  return doc;
});
```

- [ ] **Step 3: Create `src/seed/rooms.ts`**

```ts
import type { Payload } from "payload";

/**
 * Carried over verbatim from ACCOMMODATIONS in src/lib/site.ts as of
 * 2026-07-25. Provenance: the client's own info sheet, and the client's own
 * photographs in public/images. These are the three accommodation types the
 * homestay offers — four-sharing rooms, six-sharing rooms and camping tents,
 * and nothing else.
 */
export async function seedRooms(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "rooms", depth: 0 });
  if (existing?.items?.length) {
    payload.logger.info("seed: rooms already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "rooms",
    data: {
      title: "Eight rooms and camping tents. All of them face *east*.",
      items: [
        {
          name: "4-Sharing Rooms",
          count: "6 rooms",
          occupancy: "up to 4 guests per room",
          tagline:
            "Simple, spotless rooms built into the tea garden slope. Every room has an attached hot-water bath.",
          features: [
            { value: "Attached bath, hot water" },
            { value: "Tea-garden views" },
            { value: "Extra bedding on request" },
            { value: "Suited to couples & small families" },
          ],
          image: media["four-occupancy.jpeg"],
        },
        {
          name: "6-Sharing Rooms",
          count: "2 rooms",
          occupancy: "up to 6 guests per room",
          tagline:
            "Larger rooms that sleep up to six, for families and groups travelling together.",
          features: [
            { value: "Three beds, sleeps up to 6" },
            { value: "Attached bath, hot water" },
            { value: "Mountain-facing windows" },
            { value: "Best value for groups" },
          ],
          image: media["six-person-occupancy.jpeg"],
        },
        {
          name: "Camping Tents",
          count: "pitched on request",
          occupancy: "3–4 guests per tent (larger tents on request)",
          tagline: "Tents pitched right on the ridge, next to the sunrise viewpoint.",
          features: [
            { value: "Common washroom" },
            { value: "Bedding provided" },
            { value: "Larger tents for groups on request" },
            { value: "Best for first light at 5:30 AM" },
          ],
          image: media["Tent.jpeg"],
        },
      ],
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: rooms populated");
}
```

Call it from `src/seed/index.ts`.

**The `features` shape matters:** Payload arrays of a single `value` field store objects, so the component renders `feature.value`, not `feature`.

- [ ] **Step 4: Convert `src/components/Rooms.tsx`**

Add:

```tsx
import { mediaProps } from "@/lib/media";
import { renderEmphasis } from "@/lib/emphasis";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Room } from "@/payload-types";

type RoomsProps = { data: Room };
```

(Use the generated type name for the `rooms` global.)

```tsx
export default function Rooms({ data: initialData }: RoomsProps) {
  const data = useSectionPreview("rooms", initialData);
  const items = data.items ?? [];
```

Then:
- Replace the `<SectionHeading title={...}>` JSX at lines 59–64 with `title={renderEmphasis(data.title)}`. Keep `index="02"` and `label="Rooms"` exactly as they are — the 01–07 numbering stays in code.
- Replace `ACCOMMODATIONS.map((room, i) =>` at line 73 with `items.map((room, i) =>` and the `key` with `room.id ?? room.name`.
- Inside the loop add `const photo = mediaProps(room.image, `rooms.items[${i}].image`);` and use `photo.src` / `photo.alt` in the `<Image>`.
- Replace `room.features.map((feature) => ...)` at 109–116 with `(room.features ?? []).map((feature) => ...)`, keying on `feature.id ?? feature.value` and rendering `{feature.value}`.
- Delete the `ACCOMMODATIONS` import.

Leave the `matchMedia`/ScrollTrigger pinning block at lines 20–46 and every class name untouched.

- [ ] **Step 5: Wire `page.tsx`**

Add `getRooms(draft)` to the `Promise.all` and pass `<Rooms data={rooms} />`.

- [ ] **Step 6: Verify**

```bash
npm run seed && npm run lint && npm run build
```

Expected: clean, `/` still `○`.

With `npm run dev`:
- `/` renders the three room panels identically to before, and the pinned horizontal scroll still works at ≥1024px.
- Below 1024px it still falls back to a vertical stack.
- In `/admin/globals/rooms`, Live Preview updates as you type.
- **Try to delete all three room types.** Payload must refuse to go below one — this is the `minRows: 1` requirement.
- Add a fourth room type with an image, publish, and confirm it appears in the horizontal track.

- [ ] **Step 7: Commit**

```bash
git add src/globals/Rooms.ts src/seed/rooms.ts src/seed/index.ts src/payload.config.ts src/payload-types.ts src/lib/content.ts src/components/Rooms.tsx "src/app/(frontend)/page.tsx"
git commit -m "Make the rooms section editable in Payload

Room cards are an array with minRows 1, so the client can add or remove
accommodation types but never leave the section empty. Section title supports
*asterisk* emphasis; the 01-07 index and label stay in code."
```

---

## Task 7: `experiences` global

**Files:**
- Create: `src/globals/Experiences.ts`, `src/seed/experiences.ts`
- Modify: `src/payload.config.ts`, `src/lib/content.ts`, `src/seed/index.ts`, `src/components/Experiences.tsx`, `src/app/(frontend)/page.tsx`

**Interfaces:**
- Consumes: `mediaProps`, `renderEmphasis`, `useSectionPreview`.
- Produces: `getExperiences(draft: boolean)`.

- [ ] **Step 1: Create `src/globals/Experiences.ts`**

```ts
import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Experiences: GlobalConfig = {
  slug: "experiences",
  label: "Experiences",
  admin: { group: "Content", livePreview: livePreviewFor("experiences") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          "Section heading. Wrap one word in *asterisks* for the celadon accent. NOTE: this heading counts the cards below (\"Six things worth leaving the veranda for.\") — update it if you add or remove one.",
      },
    },
    {
      name: "items",
      type: "array",
      label: "Experiences",
      minRows: 1,
      required: true,
      labels: { singular: "Experience", plural: "Experiences" },
      admin: {
        description:
          "At least one is required. Drag to reorder — cards stack in this order as the visitor scrolls.",
        initCollapsed: true,
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "cardFooterLabel",
      type: "text",
      required: true,
      admin: { description: "Small location line at the bottom of every card." },
    },
  ],
};
```

- [ ] **Step 2: Register, regenerate types, add `getExperiences`**

Add `Experiences` to the `globals` array in `src/payload.config.ts`, then:

```bash
npm run generate:types
```

Add to `src/lib/content.ts`:

```ts
export const getExperiences = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "experiences",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  assertPopulated(doc.items?.[0]?.title, "experiences");
  return doc;
});
```

- [ ] **Step 3: Create `src/seed/experiences.ts`**

```ts
import type { Payload } from "payload";

/* file header comment goes here — see below */

export async function seedExperiences(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "experiences", depth: 0 });
  if (existing?.items?.length) {
    payload.logger.info("seed: experiences already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "experiences",
    data: {
      /* fields below */
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: experiences populated");
}
```

Data, carried over verbatim from `EXPERIENCES` in `src/lib/site.ts`:

```ts
      title: "Six things worth leaving the veranda for.",
      cardFooterLabel: "Aahaldara · Sittong III",
      items: [
        {
          title: "Sunrise from the hotel",
          body: "First light straight from the homestay — the sun coming up over the ridge and the tents, the Kanchenjunga range catching the earliest colour. It is what the homestay is named for.",
          image: media["Sunrise.jpg"],
        },
        {
          title: "Nights built for stargazing",
          body: "Clear high-altitude skies with almost no light pollution. The stargazing is best on cold, moonless nights.",
          image: media["stargazing"],
        },
        {
          title: "Namthing Pokhari",
          body: "A pine-ringed lake ≈2 km away at nearly 4,000 ft, home to the endangered Himalayan salamander. Best June–September, when the monsoon greens the forest.",
          image: media["NamthingPokhari.jpg"],
        },
        {
          title: "Birding in Latpanchar",
          body: "Inside the Mahananda Wildlife Sanctuary, ≈5 km away at ≈4,200 ft. Home to over 200 bird species, including the rufous-necked hornbill. Best October–April.",
          image: media["BirdinginLatpanchar.jpg"],
        },
        {
          title: "Sittong's orange orchards",
          body: "≈2 km down the ridge, the \"Orange Village of West Bengal\" turns amber October–February, peaking from late December to February.",
          image: media["SittongOraneOrchards.jpg"],
        },
        {
          title: "The Teesta below",
          body: "On clear days, the Teesta river's emerald-green thread is visible in the valley far below. The view shifts with the weather through the day.",
          image: media["teestariverfromtop.jpg"],
        },
      ],
```

Header comment for the file:

```ts
/**
 * Carried over verbatim from EXPERIENCES in src/lib/site.ts as of 2026-07-25.
 * Provenance: distances, altitudes and seasons come from the client's own info
 * sheet. Images are the client's own photographs, except "Nights built for
 * stargazing", which is still curated Unsplash stock because the client has
 * not supplied a night-sky photograph — swap it when one arrives. The "≈"
 * prefixes mark figures that could not be verified exactly; keep them.
 */
```

- [ ] **Step 4: Convert `src/components/Experiences.tsx`**

Payload singularises global slugs, so the generated type is most likely `Experience` and does not collide with the component name — but check `src/payload-types.ts` and alias it if it does:

```tsx
import { mediaProps } from "@/lib/media";
import { renderEmphasis } from "@/lib/emphasis";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Experience } from "@/payload-types";

type ExperiencesProps = { data: Experience };
```

```tsx
export default function Experiences({ data: initialData }: ExperiencesProps) {
  const data = useSectionPreview("experiences", initialData);
  const items = data.items ?? [];
```

- `title` at line 54 → `renderEmphasis(data.title)`; keep `index="03"` and `label="Experiences"`.
- `EXPERIENCES.map((exp, i) =>` at 58 → `items.map((exp, i) =>`, key `exp.id ?? exp.title`.
- `mediaProps(exp.image, ...)` for the `<Image>` at 66–72.
- `EXPERIENCES.length` at 83 → `items.length`.
- The hardcoded `Aahaldara · Sittong III` at 95 → `{data.cardFooterLabel}`.
- Delete the `EXPERIENCES` import.

Leave the per-card ScrollTrigger recede block at lines 20–42 and the `style={{ zIndex: i + 1 }}` untouched.

- [ ] **Step 5: Wire `page.tsx`, then verify**

```bash
npm run seed && npm run lint && npm run build
```

With `npm run dev`:
- The six cards still stack and recede on scroll exactly as before, and the `01 / 06` counter is correct.
- Live Preview updates as you type in `/admin/globals/experiences`.
- `minRows: 1` blocks removing the last experience.
- **Add a seventh experience and publish.** Confirm the counter reads `07 / 07` on the last card, and that the heading still says "Six" — then confirm the field's admin description warned you about exactly that. Delete the seventh again.

- [ ] **Step 6: Commit**

```bash
git add src/globals/Experiences.ts src/seed/experiences.ts src/seed/index.ts src/payload.config.ts src/payload-types.ts src/lib/content.ts src/components/Experiences.tsx "src/app/(frontend)/page.tsx"
git commit -m "Make the experiences section editable in Payload

Cards are an array with minRows 1 and any number can be stacked. The card
counter derives from the array length; the heading is editable text with an
admin warning that it names a count."
```

---

## Task 8: `gallery` global

**Files:**
- Create: `src/globals/Gallery.ts`, `src/seed/gallery.ts`
- Modify: `src/payload.config.ts`, `src/lib/content.ts`, `src/seed/index.ts`, `src/components/Gallery.tsx`, `src/app/(frontend)/page.tsx`

**Interfaces:**
- Consumes: `galleryCell` (Task 1), `mediaProps`, `renderEmphasis`, `useSectionPreview`.
- Produces: `getGallery(draft: boolean)`.

- [ ] **Step 1: Create `src/globals/Gallery.ts`**

```ts
import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Gallery: GlobalConfig = {
  slug: "gallery",
  label: "Gallery",
  admin: { group: "Content", livePreview: livePreviewFor("gallery") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: "Section heading. Wrap one word in *asterisks* for the celadon accent." },
    },
    {
      name: "photos",
      type: "array",
      label: "Photos",
      minRows: 1,
      required: true,
      labels: { singular: "Photo", plural: "Photos" },
      admin: {
        description:
          "At least one photo is required. Drag to reorder. The LAST photo is always shown full width across the page, so give that slot a wide landscape rather than an interior.",
        initCollapsed: true,
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        {
          name: "caption",
          type: "text",
          required: true,
          admin: { description: "Shown over the bottom-left of the photo, like a gallery wall label." },
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Register, regenerate types, add `getGallery`**

Add `Gallery` to the `globals` array in `src/payload.config.ts`, run `npm run generate:types`, then add to `src/lib/content.ts`:

```ts
export const getGallery = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "gallery",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  assertPopulated(doc.photos?.[0]?.caption, "gallery");
  return doc;
});
```

- [ ] **Step 3: Create `src/seed/gallery.ts`**

```ts
import type { Payload } from "payload";

/* file header comment goes here — see below */

export async function seedGallery(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "gallery", depth: 0 });
  if (existing?.photos?.length) {
    payload.logger.info("seed: gallery already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "gallery",
    data: {
      /* fields below */
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: gallery populated");
}
```

Header comment:

```ts
/**
 * Carried over verbatim from GALLERY in src/lib/site.ts as of 2026-07-25.
 * Provenance: the client's own photographs, named for their captions, except
 * "Light through the pines" and "A home-cooked spread", which are still
 * curated Unsplash stock because the client has not supplied photographs for
 * those captions — swap them when they arrive.
 *
 * Order matters: "First light over the hills" is last on purpose, because the
 * last slot renders full width. Give it a landscape, not an interior.
 */
```

```ts
      title: "Scenes from the ridge, through the seasons.",
      photos: [
        { image: media["morningontheridge.jpg"], caption: "Morning on the ridge" },
        { image: media["Thehighrangecleardayview.jpg"], caption: "The high range, clear-day view" },
        { image: media["pines"], caption: "Light through the pines" },
        { image: media["spread"], caption: "A home-cooked spread" },
        { image: media["teafromthehills.jpg"], caption: "Tea from the hills" },
        { image: media["firstlightoverthehills.jpg"], caption: "First light over the hills" },
      ],
```

- [ ] **Step 4: Convert `src/components/Gallery.tsx`**

This component is currently a **server** component. Add `"use client";` as the first line so it can subscribe to Live Preview. `ParallaxImage` is already a client component, so nothing else changes.

Delete the `LAYOUT` array at lines 11–18 and the `GALLERY` import; import `galleryCell` instead.

The generated type for the `gallery` global collides with the component name, so alias it:

```tsx
import { galleryCell } from "@/lib/gallery-layout";
import { mediaProps } from "@/lib/media";
import { renderEmphasis } from "@/lib/emphasis";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Gallery as GalleryData } from "@/payload-types";

type GalleryProps = { data: GalleryData };
```

```tsx
export default function Gallery({ data: initialData }: GalleryProps) {
  const data = useSectionPreview("gallery", initialData);
  const photos = data.photos ?? [];
```

- `title` at line 27 → `renderEmphasis(data.title)`; keep `index="04"` and `label="Gallery"`.
- `GALLERY.map((photo, i) =>` at 31 → `photos.map((photo, i) =>`.
- `const cell = LAYOUT[i % LAYOUT.length];` at 32 → `const cell = galleryCell(i, photos.length);`
- Add `const image = mediaProps(photo.image, `gallery.photos[${i}].image`);`, use `image.src` / `image.alt` on `ParallaxImage`, and key the `<figure>` on `photo.id ?? image.src`.
- `{photo.caption}` stays as it is.

- [ ] **Step 5: Wire `page.tsx`, then verify**

```bash
npm run seed && npm run lint && npm run build
```

With `npm run dev`:
- The mosaic is **identical to before**: 7/5 on the first row, 4/4/4 on the second, and "First light over the hills" full width at the bottom.
- Parallax drift still works and neighbouring frames still drift out of step.
- **Add a seventh photo and publish.** The new photo must take the full-width bottom slot and "First light over the hills" must move up into a 4-column slot — proving the panorama-last derivation. Delete the seventh again and confirm the layout returns to the original.
- `minRows: 1` blocks removing the last photo.

- [ ] **Step 6: Commit**

```bash
git add src/globals/Gallery.ts src/seed/gallery.ts src/seed/index.ts src/payload.config.ts src/payload-types.ts src/lib/content.ts src/components/Gallery.tsx "src/app/(frontend)/page.tsx"
git commit -m "Make the gallery editable in Payload

Photos and captions are an array with minRows 1. The mosaic layout now
derives from position so the last photo always takes the full-bleed panorama
slot, instead of a fixed six-slot cycle that lost that intent as soon as a
seventh photo was added."
```

---

## Task 9: `tariff` global

The largest field set, and the one with the cross-global dependency.

**Files:**
- Create: `src/globals/Tariff.ts`, `src/seed/tariff.ts`
- Modify: `src/payload.config.ts`, `src/lib/content.ts`, `src/seed/index.ts`, `src/components/Tariff.tsx`, `src/app/(frontend)/page.tsx`, `src/app/(frontend)/layout.tsx`

**Interfaces:**
- Consumes: `renderEmphasis`, `useSectionPreview`, `getRooms` (Task 6).
- Produces: `getTariff(draft: boolean)`.

- [ ] **Step 1: Create `src/globals/Tariff.ts`**

```ts
import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Tariff: GlobalConfig = {
  slug: "tariff",
  label: "Tariff & Booking",
  admin: { group: "Content", livePreview: livePreviewFor("tariff") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: "Section heading. Wrap one word in *asterisks* for the celadon accent." },
    },
    {
      name: "rates",
      type: "array",
      label: "Rates",
      minRows: 1,
      required: true,
      labels: { singular: "Rate", plural: "Rates" },
      admin: {
        description:
          "One row per type of sharing. Confirm current rates by phone before publishing — these change seasonally.",
      },
      fields: [
        { name: "name", type: "text", required: true, admin: { description: 'Type of sharing, e.g. "Triple sharing"' } },
        {
          name: "amount",
          type: "number",
          required: true,
          min: 0,
          admin: {
            description:
              "Just the number, no ₹ and no commas — 1500, not ₹1,500. The rupee symbol and comma are added automatically.",
          },
        },
        { name: "unit", type: "text", required: true, defaultValue: "per person / night" },
        { name: "note", type: "text", admin: { description: 'Optional small print, e.g. "common washroom".' } },
      ],
    },
    {
      name: "mealsIncluded",
      type: "array",
      minRows: 1,
      required: true,
      labels: { singular: "Meal", plural: "Meals" },
      admin: { description: "Shown under \"Included in every stay\". The \"All N meals included\" chip counts these automatically." },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "mealsExtra",
      type: "array",
      labels: { singular: "Extra", plural: "Extras" },
      admin: { description: "Shown under \"Available on request, extra cost\". May be left empty." },
      fields: [{ name: "value", type: "text", required: true }],
    },
    { name: "checkIn", type: "text", required: true, admin: { description: 'e.g. "12:00 PM"' } },
    { name: "checkOut", type: "text", required: true, admin: { description: 'e.g. "11:00 AM"' } },
    { name: "firstLight", type: "text", required: true, admin: { description: 'Shown on the Reserve chip, e.g. "05:30 IST"' } },
    {
      name: "notes",
      type: "array",
      minRows: 1,
      required: true,
      labels: { singular: "Note", plural: "Notes" },
      admin: {
        description:
          "These do NOT update automatically. If you change the meals or the check-in and check-out times above, edit these notes to match.",
      },
      fields: [{ name: "value", type: "textarea", required: true }],
    },
    { name: "reserveHeading", type: "text", required: true },
  ],
};
```

- [ ] **Step 2: Register, regenerate types, add `getTariff`**

Add `Tariff` to the `globals` array in `src/payload.config.ts`, run `npm run generate:types`, then add to `src/lib/content.ts`:

```ts
export const getTariff = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "tariff",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  assertPopulated(doc.rates?.[0]?.name, "tariff");
  return doc;
});
```

- [ ] **Step 3: Create `src/seed/tariff.ts`**

Same guard-and-skip wrapper as the other seed files — `findGlobal({ slug: "tariff", depth: 0 })`, skip if `existing?.rates?.length`, otherwise `updateGlobal` with `_status: "published"` and `context: { disableRevalidate: true }`, then log `seed: tariff populated`. It takes only `payload` — this global has no images.

```ts
/**
 * Carried over from TARIFF, TARIFF_NOTES, MEALS_INCLUDED, MEALS_EXTRA and
 * STAY_INFO in src/lib/site.ts as of 2026-07-25.
 *
 * Provenance: per-person, per-night rates come from the
 * nexttripbooking.com / bookingnexttrip.com listings for this property (see
 * README); meals and check-in times come from the client's own info sheet.
 * These rates can change seasonally — confirm by phone before publishing.
 *
 * The notes below were generated by string interpolation in site.ts. They are
 * now plain editable text, so they no longer track the meals list
 * automatically.
 */
```

```ts
      title: "One per-person price, *meals included*.",
      rates: [
        { name: "Triple sharing", amount: 1500, unit: "per person / night" },
        { name: "4–5 sharing", amount: 1400, unit: "per person / night" },
        { name: "Camping tent", amount: 1200, unit: "per person / night", note: "common washroom" },
      ],
      mealsIncluded: [
        { value: "Morning tea" },
        { value: "Breakfast" },
        { value: "Lunch" },
        { value: "Evening tea & snacks" },
        { value: "Dinner" },
      ],
      mealsExtra: [
        { value: "Barbecue (BBQ)" },
        { value: "Extra snacks" },
        { value: "Special dishes" },
      ],
      checkIn: "12:00 PM",
      checkOut: "11:00 AM",
      firstLight: "05:30 IST",
      notes: [
        { value: "Tariff includes morning tea, breakfast, lunch, evening tea & snacks, dinner." },
        { value: "Barbecue (BBQ), Extra snacks, Special dishes available on request at extra cost." },
        { value: "Check-in from 12:00 PM · Check-out by 11:00 AM." },
        { value: "Call ahead to confirm current rates and availability." },
      ],
      reserveHeading: "One phone call is all it takes.",
```

The first three note strings are exactly what `site.ts:242-247` renders today — verify against the running site before committing.

- [ ] **Step 4: Convert `src/components/Tariff.tsx`**

Add `"use client";` as the first line — it is currently a server component and needs to subscribe to Live Preview. `Reveal` is already a client component.

The generated type for the `tariff` global collides with the component's own name, so it must be aliased on import:

```tsx
import { renderEmphasis } from "@/lib/emphasis";
import { telHref } from "@/lib/phone";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Tariff as TariffData, Room, SiteSetting } from "@/payload-types";

type TariffProps = {
  data: TariffData;
  /**
   * The "Hot water in every room" chip is derived from the room features, so
   * this section genuinely needs the rooms data. Do not remove this prop
   * because it looks unused — it feeds the highlights below.
   */
  rooms: Room;
  phones: NonNullable<SiteSetting["bookingPhones"]>;
};

export default function Tariff({ data: initialData, rooms, phones }: TariffProps) {
  const data = useSectionPreview("tariff", initialData);
  const rates = data.rates ?? [];
  const mealsIncluded = data.mealsIncluded ?? [];
  const mealsExtra = data.mealsExtra ?? [];

  const hasHotWater = (rooms.items ?? []).some((room) =>
    (room.features ?? []).some((f) => /hot water/i.test(f.value))
  );
  const highlights = [
    `All ${mealsIncluded.length} meals included`,
    ...(hasHotWater ? ["Hot water in every room"] : []),
  ];
```

Delete the module-level `HOT_WATER` / `TARIFF_HIGHLIGHTS` constants at lines 13–21 and the whole `site.ts` import.

Then:
- `title` at 32 → `renderEmphasis(data.title)`; keep `index="05"` and `label="Tariff & Booking"`.
- `TARIFF_HIGHLIGHTS` at 39 → `highlights`.
- `TARIFF.map((item, i) =>` at 51 → `rates.map((item, i) =>`, key `item.id ?? item.name`.
- The price at 68–69 → `₹{item.amount.toLocaleString("en-IN")}`. Keep the `font-numeric` class — every number on this site uses it.
- `MEALS_INCLUDED.map((meal) => ...)` at 85 → `mealsIncluded.map((meal) => ...)` rendering `{meal.value}`, keyed on `meal.id ?? meal.value`. Same for `mealsExtra` at 98.
- `TARIFF_NOTES.map((note) => ...)` at 107 → `(data.notes ?? []).map((note) => ...)` rendering `{note.value}`.
- `STAY_INFO.checkIn` / `.checkOut` at 129/132 → `data.checkIn` / `data.checkOut`.
- The hardcoded `First light 05:30 IST` at 135 → `First light {data.firstLight}`.
- `reserveHeading` replaces the hardcoded heading at 125.
- `CONTACT.phones` at 141 → `phones`, with `href={telHref(phone.number)}`.

- [ ] **Step 5: Replace the JSON-LD price block in `layout.tsx`**

The parsing hack at `layout.tsx:88-93` exists only because prices were formatted strings. Replace with:

```tsx
const tariff = await getTariff(draft);
const tariffPrices = (tariff.rates ?? []).map((rate) => rate.amount);
const minTariff = Math.min(...tariffPrices);
const maxTariff = Math.max(...tariffPrices);
```

Add `getTariff` to the existing `Promise.all` alongside `getSiteSettings`, and remove the now-unused `TARIFF` import.

- [ ] **Step 6: Wire `page.tsx`**

```tsx
<Tariff data={tariff} rooms={rooms} phones={settings.bookingPhones!} />
```

- [ ] **Step 7: Verify**

```bash
npm run seed && npm run lint && npm run build
```

With `npm run dev`:
- Prices render `₹1,500` / `₹1,400` / `₹1,200` — with the comma, in Space Grotesk.
- The two highlight chips still read "All 5 meals included" and "Hot water in every room".
- Meals lists, notes, check-in/out chips and the Reserve band are unchanged.
- View source: JSON-LD `priceRange` still spans 1200–1500.
- In `/admin/globals/tariff`, change a rate and watch Live Preview update.
- **Remove a meal from `mealsIncluded` and publish.** The chip must change to "All 4 meals included" automatically, while note #1 still lists five meals — the documented trade-off. Put the meal back.

- [ ] **Step 8: Commit**

```bash
git add src/globals/Tariff.ts src/seed/tariff.ts src/seed/index.ts src/payload.config.ts src/payload-types.ts src/lib/content.ts src/components/Tariff.tsx "src/app/(frontend)/page.tsx" "src/app/(frontend)/layout.tsx"
git commit -m "Make the tariff and booking section editable in Payload

Sharing types and prices are an array with minRows 1; prices are numbers
rendered as Indian-format rupees so a malformed price cannot reach the live
table. Meals, times and notes are editable too. The meals-count and hot-water
chips stay derived, so they cannot go stale."
```

---

## Task 10: Retire the migrated exports, update AGENTS.md, full verification

**Files:**
- Modify: `src/lib/site.ts`, `AGENTS.md`

- [ ] **Step 1: Delete the migrated exports from `src/lib/site.ts`**

Remove `CONTACT`, `TRANSPORT_CONTACT`, `STAY_INFO`, `MEALS_INCLUDED`, `MEALS_EXTRA`, `META`, `ACCOMMODATIONS`, `EXPERIENCES`, `GALLERY`, `TARIFF`, `TARIFF_NOTES` and their JSDoc blocks.

**Keep** `SITE_URL`, `NAV_LINKS`, `ROUTES`, `GOOGLE_REVIEWS`, `TESTIMONIALS`, `MAP_EMBED_SRC`, `MAP_DIRECTIONS_URL` and their provenance comments.

Update the file's top-level comment to say it now holds only the facts Payload does not manage, and point to `src/seed/` for the provenance of everything that moved.

- [ ] **Step 2: Confirm nothing still imports them**

```bash
grep -rn "CONTACT\|TRANSPORT_CONTACT\|STAY_INFO\|MEALS_\|ACCOMMODATIONS\|EXPERIENCES\|GALLERY\|TARIFF\|META" src/ --include=*.ts --include=*.tsx | grep -v "^src/seed/" | grep -v "^src/payload-types.ts"
```

Expected: no hits outside `src/seed/`. The build would also catch this, but this is faster.

- [ ] **Step 3: Rewrite the source-of-truth section of `AGENTS.md`**

Replace the bullet that reads *"`src/lib/site.ts` is still the only source of truth for homestay facts. Do not treat a Payload collection as a second home for a price, phone number, or distance."* with:

```markdown
- **Payload owns the editable content; `src/lib/site.ts` owns the rest.** Payload
  globals manage the hero, rooms, experiences, gallery, tariff, and every phone
  number — edit those at `/admin`, never in code. `site.ts` still owns
  `SITE_URL`, `NAV_LINKS`, `ROUTES`, `TESTIMONIALS`, `GOOGLE_REVIEWS` and the
  map URLs. Don't move a fact from one to the other without updating this note.
- **Provenance for content that moved lives in `src/seed/`.** Each seed file
  carries the original JSDoc provenance comments; editor-facing guidance (such
  as "confirm current rates by phone") lives in the fields' `admin.description`
  so the client sees it while editing.
- **`npm run seed`** populates the six globals and the media library from the
  seed files. It is idempotent — existing content is skipped, never clobbered.
  A fresh clone must run it, or the build fails with a message telling you to.
- **`PREVIEW_SECRET` and `NEXT_PUBLIC_SERVER_URL` must be set in `.env`.**
  Live Preview fails without them.
- **Preview mode disables animations on purpose.** `prefersReducedMotion()` in
  `src/lib/gsap.ts` returns true inside the admin's preview iframe, because
  Live Preview re-renders on every keystroke and that re-splits the hero
  headline and rebuilds ScrollTriggers mid-animation. Don't "fix" this.
- **The gallery's last photo always takes the full-bleed slot** — see
  `galleryCell()` in `src/lib/gallery-layout.ts`. Don't restore a fixed
  layout cycle; it silently lost the panorama slot when a photo was added.
```

Also update the Images section: images are now Media documents managed in the admin, `public/images/` holds the originals and is the seed source, and alt text lives on the Media document. Keep the existing warnings about remote domains needing `next.config.ts` allowlisting.

Keep every other section of `AGENTS.md` unchanged — the notes on generated files, the `(payload)` route group, `robots.ts`/`favicon.ico` at the app root, the palette, the fonts, and the Docker requirement are all still true.

- [ ] **Step 4: Full verification**

```bash
npm run lint
npm run build
```

Both must pass clean. Confirm the build output still shows `○ /`.

- [ ] **Step 5: Responsive check — required, and not automated**

`npm run dev`, then check **desktop, laptop, tablet and mobile** widths. There is no automated responsive tooling in this project, so this is a manual pass. Pay attention to:
- Rooms: pinned horizontal scroll at ≥1024px, vertical stack below.
- Experiences: sticky card stack, previous card receding.
- Gallery: the mosaic collapsing to one column on mobile.
- Tariff: the price rows wrapping, and the Reserve band's phone buttons.
- Footer: the clip-path reveal ending in a position with no overlap.

- [ ] **Step 6: End-to-end admin smoke test**

For each of the six globals: open it, confirm Live Preview shows the real page, make an edit, **Save as draft** and confirm `/` is unchanged in a normal tab, then **Publish** and confirm `/` updates within seconds. Then revert the edit and republish.

Also confirm version history exists on at least one global and that reverting to a previous version works.

- [ ] **Step 7: Commit**

```bash
git add src/lib/site.ts AGENTS.md
git commit -m "Retire migrated content from site.ts and update AGENTS.md

site.ts now holds only what Payload doesn't manage. AGENTS.md's
source-of-truth rule is rewritten to match, and records the seed script, the
new env vars, and why preview mode disables animations."
```

---

## Post-implementation notes for the user

Report these plainly when the work is done:

1. **`.env` needs `PREVIEW_SECRET` and `NEXT_PUBLIC_SERVER_URL`** — not committed, so they must be set in every environment including the eventual host.
2. **Media uploads still go to local disk.** On most hosts a redeploy wipes them, which would break every client-uploaded image. Before launch this needs a persistent volume or a storage adapter (S3, UploadThing). Out of scope here, per the spec.
3. **Unsplash may now be removable** from `images.remotePatterns` in `next.config.ts`, since the three stock photos are local Media documents after seeding. Verify no remote image URLs remain before removing it.
4. **Three stock photos are still stand-ins** for photographs the client hasn't supplied: the stargazing experience, "Light through the pines", and "A home-cooked spread". The client can now swap them in the admin without a developer.
