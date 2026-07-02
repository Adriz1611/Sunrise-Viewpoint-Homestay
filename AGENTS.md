<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sunrise Viewpoint Homestay — Agent Notes

A single-page marketing site for a real homestay client (not a demo). Read this before making changes.

## Source of truth

- **`src/lib/site.ts`** is the only place content lives — copy, contact numbers, tariff, routes, testimonials, image URLs. Never hardcode a homestay fact (a price, a phone number, a distance) inside a component; add it to `site.ts` and import it.
- Every export in `site.ts` has a JSDoc comment stating where its facts came from — the client's own info sheet, a Google Maps reviews export, or a named third-party listing used only to fill gaps the info sheet didn't cover. When you add or change a fact, keep that provenance comment accurate. If a fact can't be verified, say so explicitly (an "≈" prefix, a note to confirm by phone) rather than presenting a guess as certain — this client's real prices and phone numbers are at stake.

## Images

- Only one image lives in this repo: `public/images/hero-kanchenjunga.jpg` (the hero background, supplied by the client). **Don't change or replace this one** without being asked to.
- Every other photo (rooms, About, gallery) is **curated Unsplash stock** — not real photos of this property. An earlier version hotlinked real but low-resolution photos scraped from third-party listing sites; that looked worse than honest stock photography, so don't reintroduce that pattern. Only `images.unsplash.com` is allowlisted in `next.config.ts`'s `images.remotePatterns`; adding a new remote image domain means adding it there too, or `next/image` will refuse to render it.
- Before using any new photo URL (Unsplash or otherwise), verify it actually resolves (`curl -o /dev/null -w "%{http_code}" <url>`) rather than trusting a photo ID from memory — a wrong ID renders as a broken image with no build-time error.
- Flag to whoever owns the project that these are stock, not the family's own photography — see README's TODO list.

## Verification

After any change, run both before considering a task done:

```bash
npm run lint
npm run build
```

Both must pass clean. There's no unit test suite — the build (which type-checks) and lint are the only automated signal, so don't skip either.

For layout/CSS changes, also run `npm run dev` and manually check desktop, laptop, tablet, and mobile widths before calling it done — there's no automated responsive-check tooling in this project.

## Design language

- Dark editorial theme: ink / cream / ember / amber palette, defined as Tailwind v4 `@theme` tokens in `src/app/globals.css`.
- Fonts: Fraunces (display serif), Manrope (body), Space Grotesk (`.font-numeric`, tabular figures — used for every number on the site: phone numbers, prices, coordinates, distances).
- Scroll reveals use the `Reveal` component (a small IntersectionObserver wrapper, no animation library) and respect `prefers-reduced-motion`.
- Section numbering (01–07) is meaningful and threaded through `NAV_LINKS` in `site.ts`, `SectionHeading`, and the mobile nav menu — keep all three in sync if a section is added, removed, or reordered.
- Marquees (the top ticker and the testimonials rows) render multiple duplicated copies of their content so the loop never runs out of width on ultra-wide screens — don't "simplify" this to fewer copies without checking it still covers >2500px.
