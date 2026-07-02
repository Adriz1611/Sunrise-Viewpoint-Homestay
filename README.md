<div align="center">

# Sunrise Viewpoint Homestay

**A family-run homestay on the Aahaldara ridge, Darjeeling — locally known as _Chamling Homestay_.**

Wake to a 180° sunrise over Kanchenjunga · Aahal Dara, Sittong III · West Bengal

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

An editorial, single-page marketing site built for a real client — not a template. Every fact on it (prices, phone numbers, distances, reviews) is either sourced from the homestay's own info sheet or a verified listing, and every export in [`src/lib/site.ts`](src/lib/site.ts) says which. See [Content sources](#-content-sources) below.

## Contents

- [Stack](#stack)
- [Getting started](#-getting-started)
- [Sections](#-sections)
- [Design language](#-design-language)
- [Editing content](#-editing-content)
- [Content sources](#-content-sources)
- [Images](#-images)
- [Checking responsiveness](#-checking-responsiveness)
- [Project structure](#-project-structure)

## Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 — design tokens as `@theme` in [`globals.css`](src/app/globals.css) |
| **Fonts** | Fraunces (display serif), Manrope (body), Space Grotesk (numerals) — via `next/font` |
| **Images** | `next/image` — one local client photo (hero) + curated Unsplash stock elsewhere |
| **Motion** | No animation library — a small `IntersectionObserver` component (`Reveal.tsx`), respects `prefers-reduced-motion` |
| **Tests** | None (no test suite) — `npm run lint` + `npm run build` are the signal; `npm run check:responsive` for layout |

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## 🧭 Sections

The whole site is one page, numbered 01–07 and threaded through the nav, mobile menu, and each section heading — keep all three in sync if you add, remove, or reorder one.

| # | Section | What's there |
|---|---|---|
| 01 | **The Homestay** | Family story — owners, tea garden, "nearly a decade" of hosting |
| 02 | **Rooms** | 6 Standard Rooms, 2 Family Rooms, camping tents — real counts & occupancy |
| 03 | **Experiences** | Sunrise, stargazing, Namthing Pokhari, Latpanchar birding, Sittong orchards, the Teesta |
| 04 | **Gallery** | Regional photography |
| 05 | **Tariff & Booking** | Per-person/night pricing by sharing, meal plan, booking contact |
| 06 | **Guest Book** | Real Google reviews, marquee-scrolled, linking to the full listing |
| 07 | **Getting Here** | Route distances/times from NJP, Bagdogra, Siliguri, Darjeeling + satellite Google Maps embed |

## 🎨 Design language

- **Palette** — dark "ink" background with cream, ember, and amber accents (Tailwind `@theme` tokens in `globals.css`).
- **Type** — Fraunces for display headlines, Manrope for body copy, Space Grotesk with tabular figures (`.font-numeric`) for every number on the site: phone numbers, prices, coordinates, distances.
- **Motion** — scroll-reveal fades via the `Reveal` component; marquees (top ticker + testimonials) render multiple duplicated copies of their content so the loop never runs dry on ultra-wide screens.

## ✏️ Editing content

All copy, room details, tariffs, routes, and contact info live in **[`src/lib/site.ts`](src/lib/site.ts)** — edit that one file to update the site. Nothing else should hardcode a homestay fact.

## 📚 Content sources

Every export in `site.ts` has a JSDoc comment stating where its facts came from:

- **The homestay's own info sheet** (provided by the client) — owners (Harkaram & Saru Chamling and their three daughters), the tea-garden setting, room/tent counts and occupancy, check-in/out times, meal plan, booking and transport contact numbers, and nearby attractions (Namthing Pokhari, Latpanchar, Sittong orchards) with their distances and best-visit seasons.
- **A CSV export of the homestay's Google Maps reviews** (provided by the client) — `TESTIMONIALS` are real guest reviews, lightly excerpted at sentence boundaries for card length (never reworded).
- **Verified third-party listings**, used only where the info sheet didn't give a number — tariff (nexttripbooking.com / bookingnexttrip.com) and route distances (darjeeling-tourism.com's Sittong travel guide).

<details>
<summary>Why two of the ~18 exported reviews aren't shown</summary>

One 2-star review was left out of this curated showcase — the full spread, critical reviews included, is one tap away via "Read them all on Google." One 5-star review was excluded because its wording ("hotel," "breakfast buffet") didn't match a homestay and read like a mismatched or templated review.

</details>

## 🖼️ Images

- **The hero background is the client's own photo** — `public/images/hero-kanchenjunga.jpg` (6000×4000). **Don't replace this one.**
- Every other photo (rooms, About, gallery) is **curated Unsplash stock**, not a real photo of this property. An earlier version hotlinked real but low-resolution photos scraped from the property's third-party listing sites; that looked worse than honest stock photography, so the project reverted to representative photography instead. URLs live in `ACCOMMODATIONS` and `GALLERY` in `site.ts`, plus one inline `Image` in `About.tsx`.
- Only `images.unsplash.com` is allowlisted in `next.config.ts`'s `images.remotePatterns` — add a new host there if you introduce another image source, and verify any new photo URL actually resolves before using it.
- Keep the tone of any replacement photos consistent with the rest of the site: warm, simple, mountain-homestay — not glossy or resort-like.

> **Still TODO before going live**
> - Swap the stock room/About/gallery photos for the family's own photography whenever it's available.
> - Confirm current tariff rates by phone — the sourced numbers can change seasonally.

## 📱 Checking responsiveness

```bash
npm run dev                 # in one terminal
npm run check:responsive    # in another — requires localhost:3000 running
```

Screenshots + a `results.json` land in `responsive-check-output/` (gitignored). It covers desktop (1920px, and 1536px — what a 1920px monitor renders at 125% OS scaling), laptop (1366px), tablet (portrait 768px and landscape 1024px), and mobile (390px, 360px), and flags horizontal overflow, wrapped nav links, and the footer's background-word text overlapping the content above it — the three classes of bug this project has actually hit. Extend `BREAKPOINTS` / `SECTIONS` in `scripts/responsive-check.mjs` if you add sections worth checking.

## 📁 Project structure

```
src/
  app/            layout (fonts, metadata), page, global styles + theme tokens
  components/     Nav, Hero, Marquee, About (01), Rooms (02), Experiences (03),
                  Gallery (04), Tariff (05), Testimonials (06 Guest Book),
                  GettingHere (07 + satellite Google Maps embed), Footer,
                  Reveal, SectionHeading
  lib/site.ts     single source of truth for all content
scripts/
  responsive-check.mjs   Playwright-based layout audit across breakpoints
public/
  images/hero-kanchenjunga.jpg   the one real client photo on the site
```

---

<div align="center">

Private client project — not open source.

</div>
