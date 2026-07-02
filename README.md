# Sunrise Viewpoint Homestay — Aahaldara

An editorial, single-page marketing site for Sunrise Viewpoint Homestay (locally known as **Chamling Homestay**), a family-run stay in Aahal Dara, Sittong III, Darjeeling. Built with **Next.js 16 (App Router)** and **Tailwind CSS v4**.

## Stack

- Next.js 16 + React 19, TypeScript, Turbopack
- Tailwind CSS v4 (`@theme` design tokens in `src/app/globals.css`)
- `next/font` — Fraunces (display), Manrope (body), Space Grotesk (numerals / phone numbers, with tabular figures)
- `next/image` — one local photo (hero) plus curated Unsplash stock elsewhere (see Images below)
- Zero animation libraries — scroll reveals use a small `IntersectionObserver` component (`src/components/Reveal.tsx`) and respect `prefers-reduced-motion`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content

All copy, rooms, tariffs, routes and contact details live in **`src/lib/site.ts`** — edit that one file to update the site.

## Content sources

Facts in `site.ts` come from three places, noted inline as JSDoc comments above each export:

- **The homestay's own info sheet** (provided by the client) — owners (Harkaram & Saru Chamling and their three daughters), the tea-garden setting, room/tent counts and occupancy, check-in/out times, meal plan, booking and transport contact numbers, and nearby attractions (Namthing Pokhari, Latpanchar, Sittong orchards) with their distances and best-visit seasons.
- **A CSV export of the homestay's Google Maps reviews** (provided by the client) — `TESTIMONIALS` are real guest reviews, lightly excerpted at sentence boundaries for card length (never reworded). Two of the ~18 exported reviews were left out of this curated showcase: one 2-star review (the full spread, critical reviews included, is one tap away via "Read them all on Google") and one 5-star review whose wording ("hotel," "breakfast buffet") didn't match a homestay and read like a mismatched/templated review.
- **Verified third-party listings**, used only where the info sheet didn't give a number:
  - Tariff (₹1,200–1,600 per person/night by sharing) — nexttripbooking.com / bookingnexttrip.com
  - Route distances (NJP, Bagdogra, Siliguri, Darjeeling) — darjeeling-tourism.com's Sittong travel guide

## Images

- **The hero background is the client's own photo**, stored locally at `public/images/hero-kanchenjunga.jpg` (6000×4000) — do not replace this one.
- Every other photo — rooms, tent, About, gallery — is **curated Unsplash stock**, not a real photo of this property. An earlier version hotlinked real (but low-resolution, third-party-owned) photos from the property's listing sites; those looked worse than honest, high-quality stock, so the project reverted to representative photography instead. URLs live in `ACCOMMODATIONS` and `GALLERY` in `site.ts`, plus one inline `Image` in `About.tsx`. Only `images.unsplash.com` is allowlisted in `next.config.ts`'s `images.remotePatterns` — add a new host there if you introduce another image source.
- Keep the tone of any replacement photos consistent with the rest of the site: warm, simple, mountain-homestay — not glossy or resort-like.

> **Still TODO before going live**
>
> - Swap the stock room/About/gallery photos for the family's own photography whenever it's available — see Images above.
> - Confirm current tariff rates by phone — the sourced numbers can change seasonally.

## Structure

```
src/
  app/            layout (fonts, metadata), page, global styles + theme tokens
  components/     Nav, Hero, Marquee, About (01), Rooms (02), Experiences (03),
                  Gallery (04), Tariff (05), Testimonials (06 Guest Book),
                  GettingHere (07 + satellite Google Maps embed), Footer,
                  Reveal, SectionHeading
  lib/site.ts     single source of truth for all content
```
