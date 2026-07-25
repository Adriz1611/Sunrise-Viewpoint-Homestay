<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sunrise Viewpoint Homestay — Agent Notes

A single-page marketing site for a real homestay client (not a demo). Read this before making changes.

## Source of truth

- **Payload owns the editable content; `src/lib/site.ts` owns the rest.** Payload globals manage the hero, rooms, experiences, gallery, tariff, and every phone number, coordinate and address — edit those at `/admin`, never in code. `site.ts` still owns `SITE_URL`, `NAV_LINKS`, `ROUTES`, `TESTIMONIALS`, `GOOGLE_REVIEWS` and the map URLs. Don't move a fact from one to the other without updating this note.
- Never hardcode a homestay fact (a price, a phone number, a distance) inside a component. If Payload manages that section, it belongs in a global; otherwise add it to `site.ts` and import it.
- **Provenance for content that moved lives in `src/seed/`.** Each seed file carries the original JSDoc provenance comments; editor-facing guidance (such as "confirm current rates by phone") lives in the fields' `admin.description` so the client sees it while editing. Every remaining export in `site.ts` keeps its own provenance comment. When you add or change a fact, keep that comment accurate. If a fact can't be verified, say so explicitly (an "≈" prefix, a note to confirm by phone) rather than presenting a guess as certain — this client's real prices and phone numbers are at stake.
- **`npm run seed`** populates the six globals and the media library from the seed files. It is idempotent — existing content is skipped, never clobbered, so a client's edits survive a re-run. A fresh clone must run it, or the build fails with a message telling you to.

## Images

- **Images are Media documents managed in the admin.** `public/images/` holds the client's originals and is the seed source — `npm run seed` uploads each one into the Media collection (reusing by filename, never overwriting). Alt text lives on the Media document, so it is written once and never duplicated per usage. **Don't change the hero's default photo (`hero-kanchenjunga.jpg`)** without being asked to.
- A few slots still fall back to **curated Unsplash stock** where the client hasn't supplied a photo yet — currently the "Nights built for stargazing" experience and the "Light through the pines" / "A home-cooked spread" gallery captions. These are seeded as ordinary Media documents (see `src/seed/media.ts`, which notes each one), so the client can now swap them at `/admin` without a developer. Don't reintroduce the old pattern of hotlinking low-resolution photos scraped from third-party listing sites — that looked worse than honest stock.
- An empty upload field renders as a flat Ink Black slot rather than throwing (`mediaProps` in `src/lib/media.ts`), because drafts skip required-field validation and a throw would kill the Live Preview pane. A *bare relationship id* still throws — that one means a fetcher forgot `depth: 1`.
- Only `images.unsplash.com` is allowlisted in `next.config.ts`'s `images.remotePatterns`; adding a new *remote* image domain means adding it there too, or `next/image` will refuse to render it. Local `/images/…` files need no allowlisting.
- Before using any new *remote* photo URL, verify it actually resolves (`curl -o /dev/null -w "%{http_code}" <url>`) rather than trusting a photo ID from memory — a wrong ID renders as a broken image with no build-time error. For local files, prefer web-safe names (no spaces) so the `/images/…` path never needs URL-encoding.

## Payload CMS

- The admin panel lives at `/admin`, backed by `src/payload.config.ts` with collections
  in `src/collections/`. REST/GraphQL are at `/api/*`. The `@payloadcms/plugin-mcp` MCP
  server described in `docs/superpowers/plans/` is **not** installed yet — there is no
  `/api/mcp` route.
- `src/app` is split into two route groups: `(frontend)` holds the public marketing site
  (layout, page, globals.css, sitemap), `(payload)` holds Payload's generated admin and
  API routes. Route groups do not affect URLs — `/`, `/sitemap.xml`, and `/robots.txt`
  are unchanged.
- **`src/app/robots.ts` and `src/app/favicon.ico` must stay at the `src/app/` root** — do
  not tidy them into `(frontend)`. Next anchors their metadata patterns to the app root
  (`FAVICON_REGEX = /^[\/]favicon\.ico$/`, `ROBOTS_TXT_REGEX = /^[\/]robots\.txt$/` in
  `next/dist/lib/metadata/is-metadata-route.js`), so a route-group prefix 404s both
  routes with no build error. `sitemap.ts` nests fine because its regex is unanchored.
- **Six globals in `src/globals/` hold the editable content**: `hero`, `rooms`,
  `experiences`, `gallery`, `tariff` and `site-settings`. All six have drafts enabled
  (`versions: { drafts: true, max: 20 }` — note `max`, not the collection-only
  `maxPerDoc`), a `revalidateHome` afterChange hook, and Live Preview. Fetch them only
  through `src/lib/content.ts`, which wraps each read in React `cache()` at `depth: 1`.
- **`PREVIEW_SECRET` and `NEXT_PUBLIC_SERVER_URL` must be set in `.env`.** Live Preview
  fails without them. `NEXT_PUBLIC_SERVER_URL` must be the exact origin the admin is
  served at, with no trailing slash: it is compared verbatim against `event.origin`, and
  `NEXT_PUBLIC_*` is frozen at build time.
- **`/` must stay statically prerendered (`○` in the build output, never `ƒ`).** The
  preview slug is deliberately never read from the page's `searchParams`, because that
  would opt the homepage into dynamic rendering. Preview instead runs through
  `/next/preview`, which validates the secret and enables Next draft mode.
- **Preview mode disables animations on purpose.** `prefersReducedMotion()` in
  `src/lib/gsap.ts` returns true inside the admin's preview iframe, because Live Preview
  re-renders on every keystroke and that re-splits the hero headline and rebuilds
  ScrollTriggers mid-animation. Don't "fix" this. It also means the Rooms section shows
  as a vertical stack in the preview pane rather than pinning horizontally.
- **Live Preview routes by `event.data.globalSlug`, not `globalType`.** The merge
  endpoint discards the DB document when the admin supplies form data
  (`payload/dist/globals/operations/findOne.js`), so `globalType` is absent from its
  response and gating on it silently ignores every keystroke. See
  `src/lib/useSectionPreview.ts`.
- **The gallery's last photo always takes the full-bleed slot** — see `galleryCell()` in
  `src/lib/gallery-layout.ts`. Don't restore a fixed layout cycle; it silently lost the
  panorama slot as soon as a seventh photo was added.
- `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js` are generated —
  never hand-edit them. Regenerate with `npm run generate:types` and
  `npm run generate:importmap`.
- Everything under `src/app/(payload)/` is generated by Payload and marked
  "DO NOT MODIFY" — treat it as vendored.

## Verification

After any change, run both before considering a task done:

```bash
npm run lint
npm run build
```

Both must pass clean. There's no unit test suite — the build (which type-checks) and
lint are the only automated signal, so don't skip either.

**`npm run dev` and `npm run build` both require Docker to be running.** Each is wrapped
in `scripts/with-db.sh`, which starts the Postgres container (host port 5433), runs the
command, and stops the container on exit. Payload connects to the database during both
dev and build, so neither works without it. Use `npm run db:up` / `npm run db:down` to
control the container by hand.

For layout/CSS changes, also run `npm run dev` and manually check desktop, laptop, tablet, and mobile widths before calling it done — there's no automated responsive-check tooling in this project.

## Design language

- Strictly dark theme on the client's palette: Ink Black `#021C1B`, Muted Teal `#82C4A1` (token `teal`, primary accent), Celadon `#AED9C2` (token `celadon`, emphasis), Honeydew `#D5EBE0` (token `cream`, body text) — plus derived tints (`ink-soft`, `ink-line`, `cream-dim`, `dawn`) of the same hue, all defined as Tailwind v4 `@theme` tokens in `src/app/globals.css`. Don't introduce warm/orange accents; the client rejected the earlier ember/amber palette.
- Fonts: Fraunces (display serif), Manrope (body), Space Grotesk (`.font-numeric`, tabular figures — used for every number on the site: phone numbers, prices, coordinates, distances).
- Motion is GSAP-driven (ScrollTrigger + SplitText, with Lenis smooth scrolling wired into GSAP's ticker in `SmoothScroll.tsx`). Plugin registration and the shared `prefersReducedMotion()` guard live in `src/lib/gsap.ts` — every animation entry point checks that guard and bails to static, fully visible content. Reusable primitives: `Reveal` (fade-up), `AnimatedTitle` (masked line reveal, reverts the split on completion), `ParallaxImage` (scrubbed drift + wipe-in), `Counter` (count-up stats). Don't reintroduce CSS-keyframe scroll animations alongside these.
- Set pieces, each self-contained in its component: `Hero` (cinematic intro — masked headline reveal and backdrop zoom — plays on mount, no preloader gate), `Rooms` (pinned horizontal scroll on lg+, vertical stack below), `Experiences` (sticky stacked cards, previous card recedes via GSAP), `Footer` (clip-path "opens inside a frame" reveal + backdrop word rise — its end state must match the static CSS position that was verified overlap-free).
- Section numbering (01–07) is meaningful and threaded through `NAV_LINKS` in `site.ts`, `SectionHeading`, and the mobile nav menu — keep all three in sync if a section is added, removed, or reordered.
- Marquees (the top ticker and the testimonials rows) render multiple duplicated copies of their content so the loop never runs out of width on ultra-wide screens — don't "simplify" this to fewer copies without checking it still covers >2500px.
