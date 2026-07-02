# Sunrise Viewpoint Homestay — Aahaldara

An editorial, single-page marketing site for a family-run homestay on the Aahaldara ridge (Darjeeling Hills), built with **Next.js 16 (App Router)** and **Tailwind CSS v4**.

## Stack

- Next.js 16 + React 19, TypeScript, Turbopack
- Tailwind CSS v4 (`@theme` design tokens in `src/app/globals.css`)
- `next/font` — Fraunces (display), Manrope (body), Space Grotesk (numerals / phone numbers, with tabular figures)
- `next/image` with remote Unsplash placeholders
- Zero animation libraries — scroll reveals use a small `IntersectionObserver` component (`src/components/Reveal.tsx`) and respect `prefers-reduced-motion`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content

All copy, rooms, tariffs, routes and contact details live in **`src/lib/site.ts`** — edit that one file to update the site.

> **Before going live**
>
> - Replace the placeholder phone numbers and email in `CONTACT` (`src/lib/site.ts`).
> - Replace the Unsplash placeholder photos (rooms, gallery, hero) with real photographs of the homestay — swap the URLs in `src/lib/site.ts`, `src/components/Hero.tsx` and `src/components/About.tsx`. If you host photos locally in `public/`, you can remove `images.remotePatterns` from `next.config.ts`.
> - Verify tariffs, distances and travel times in `TARIFF` and `ROUTES`.

## Structure

```
src/
  app/            layout (fonts, metadata), page, global styles + theme tokens
  components/     Nav, Hero, Marquee, About (01), Rooms (02), Experiences (03),
                  Gallery (04), Tariff (05), GettingHere (06 + Google Maps embed),
                  Footer, Reveal, SectionHeading
  lib/site.ts     single source of truth for all content
```
