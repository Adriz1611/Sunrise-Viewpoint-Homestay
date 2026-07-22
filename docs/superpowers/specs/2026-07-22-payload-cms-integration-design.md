# Payload CMS Integration — Design

**Date:** 2026-07-22
**Status:** Approved, pending implementation plan

## Goal

Add Payload CMS to the existing Sunrise Viewpoint Homestay marketing site, along with
Payload's MCP server plugin and Payload's agent skills. Scope is **scaffold only**:
get a working admin panel, MCP endpoint, and skills installed. Do not migrate site
content into the CMS yet.

Driven by three sources:

- https://payloadcms.com/docs/getting-started/installation (existing-project install)
- https://payloadcms.com/docs/plugins/mcp (MCP server plugin)
- https://github.com/payloadcms/skills (agent skills)

## Non-goals

- Migrating `src/lib/site.ts` content into Payload collections. `site.ts` remains the
  single source of truth for every homestay fact, exactly as AGENTS.md requires.
- Any visual or copy change to the public site. The rendered page must be
  byte-for-byte equivalent before and after.
- Production/hosted database setup. Local Docker Postgres only; the deploy-time
  connection string is a later decision.

## Compatibility baseline (verified 2026-07-22)

| Item | Required | Actual | OK |
|---|---|---|---|
| Next.js | `16.2.6+` | `16.2.10` | yes |
| Node | `20.9.0+` | `24.15.0` | yes |
| Package manager | any | npm 11.13.0 (`package-lock.json`) | docs show pnpm; translate to npm |
| Database | Mongo / Postgres / SQLite | Postgres via Docker | chosen |

## Architecture

### 1. Route-group restructure

Payload owns `/admin` and `/api/*`, which requires splitting `src/app` into two route
groups. Route groups do not affect URLs, so every public path is unchanged.

```
src/app/
├── robots.ts              # STAYS at root — Next anchors ^/robots.txt
├── favicon.ico            # STAYS at root — Next anchors ^/favicon.ico
├── (frontend)/            # git mv from src/app/
│   ├── layout.tsx         # root layout — fonts, metadata, JSON-LD
│   ├── page.tsx           # the single marketing page
│   ├── globals.css
│   └── sitemap.ts         # sitemap regex is unanchored, so this nests fine
└── (payload)/             # new, from Payload's blank template
    ├── layout.tsx
    ├── admin/[[...segments]]/page.tsx + not-found.tsx
    ├── admin/importMap.js # generated
    └── api/
        ├── [...slug]/route.ts
        ├── graphql/route.ts
        └── graphql-playground/route.ts
```

Component imports use the `@/*` alias (`@/components/...`, `@/lib/site`), so nothing
inside `src/components` or `src/lib` changes.

URLs after the move: `/`, `/sitemap.xml`, `/robots.txt` (unchanged), plus new `/admin`,
`/api/*`, `/api/mcp`.

### 2. Server/client component boundary — an invariant to preserve

This already holds today and must still hold afterward:

- `layout.tsx` and `page.tsx` are **server components**. Neither carries `"use client"`.
- Every GSAP/Lenis animation lives in a leaf client component imported by the server
  page: `SmoothScroll`, `Hero`, `Marquee`, `Counter`, `AnimatedTitle`, `Rooms`,
  `ParallaxImage`, `Nav`, `Experiences`, `CallPill`, `Testimonials`, `Reveal`, `Footer`.
- `About`, `Gallery`, `Tariff`, `GettingHere`, `SectionHeading`, `icons` are server
  components.

No conversion work is needed. The restructure must not introduce `"use client"` into
`(frontend)/layout.tsx` or `(frontend)/page.tsx`. Verified after the move by grepping
those two files.

### 3. Packages

```
payload
@payloadcms/next
@payloadcms/db-postgres
@payloadcms/richtext-lexical
@payloadcms/plugin-mcp
sharp
graphql
```

Installed with npm, at whatever version the CLI/registry resolves. All Payload
packages must share one identical version.

### 4. Configuration files

- **`payload.config.ts`** at repo root: `postgresAdapter`, `lexicalEditor`, `sharp`,
  `secret` from `PAYLOAD_SECRET`, typescript output to `src/payload-types.ts`,
  collections `Users` + `Media`, plugins `[mcpPlugin(...)]`.
- **`tsconfig.json`**: add `"@payload-config": ["./payload.config.ts"]` to `paths`,
  keeping the existing `"@/*": ["./src/*"]` entry.
- **`next.config.ts`**: wrap the existing export in `withPayload(...)`. The current
  `poweredByHeader: false` and the entire `images` block — `remotePatterns` for
  `images.unsplash.com`, `formats`, `minimumCacheTTL` — are preserved verbatim.
  AGENTS.md depends on that allowlist.

### 5. Collections

Minimum needed for a functioning admin panel:

- **`Users`** — `auth: true`, so a first user can be created and the panel logged into.
- **`Media`** — `upload: true`, local disk under `public/media`, `alt` text field.

Nothing else. No content collections until content migration is separately designed.

### 6. Postgres and dev lifecycle

`docker-compose.yml` with a single `postgres:17` service:

- Host port **5433** mapped to container 5432, so it cannot collide with a
  system Postgres on the default port.
- Named volume for persistence across restarts.
- `healthcheck` using `pg_isready`, so startup can be awaited rather than raced.

`scripts/with-db.sh` wraps any command so the database is up for its lifetime and
stopped when it exits:

```bash
#!/usr/bin/env bash
set -euo pipefail
cleanup() { docker compose stop -t 5 >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM
docker compose up -d --wait
exec "$@"
```

`docker compose stop` (not `down`) preserves the volume.

`package.json` scripts become:

- `dev` → `./scripts/with-db.sh next dev`
- `build` → `./scripts/with-db.sh next build`
- `db:up` / `db:down` escape hatches for running the DB standalone.

Consequence: **`npm run build` now requires Docker to be running.** This is a new
hard dependency in the AGENTS.md verification loop and must be documented there.

### 7. Environment

`.env` (already covered by `.env*` in `.gitignore`):

```
DATABASE_URI=postgres://payload:payload@localhost:5433/sunrise_viewpoint
PAYLOAD_SECRET=<generated with openssl rand -hex 32>
```

A committed `.env.example` mirrors these keys with placeholder values.

### 8. MCP server

`mcpPlugin()` registered in `payload.config.ts`, exposing the endpoint at
`/api/mcp`. Access is two-step by design: a resource must be `enabled` in config
*and* allowed on the API key.

The API key cannot exist before a user does, so connection is a handoff:

1. Implementation brings up `/admin`, user creates the first account.
2. User creates an API key at **MCP → API Keys** and enables the desired resources.
3. Then run:

```bash
claude mcp add --transport http Payload \
  http://127.0.0.1:3000/api/mcp \
  --header "Authorization: Bearer <key>"
```

The key is a live credential and is never committed or written into any tracked file.

### 9. Skills

```bash
npx skills add payloadcms/skills
```

Installs two skills — *Payload* (collections, fields, hooks, access control, queries,
plugin development) and *CMS Migration* (interactive collection design from a source
CMS). Install location is whatever the `skills` CLI chooses; it will be confirmed by
inspection afterward and, if it lands inside the repo, either committed deliberately
or gitignored — not left as an accidental untracked directory.

### 10. AGENTS.md update

Add a Payload section recording:

- the `(frontend)` / `(payload)` split and where frontend files now live;
- that `site.ts` is still the only source of truth for homestay facts, and Payload
  collections are not to be treated as a second one;
- that `npm run build` now needs Docker up, via `scripts/with-db.sh`;
- the server/client invariant from §2.

## Verification

Per AGENTS.md, both must pass clean:

```bash
npm run lint
npm run build
```

Plus, specific to this change:

1. `/`, `/sitemap.xml`, `/robots.txt` all still respond 200 with unchanged content.
2. `/admin` loads and a first user can be created.
3. `grep -L "use client" src/app/\(frontend\)/{layout,page}.tsx` confirms both are
   still server components.
4. `npm run dev`, then Ctrl-C — confirm the Postgres container actually stops.
5. Manual responsive check at desktop / laptop / tablet / mobile widths, and a visual
   confirmation that the Hero intro, Lenis smooth scroll, pinned Rooms scroll, and
   Footer clip-path reveal all still run. AGENTS.md requires this for layout changes
   and there is no automated tooling for it.

## Risks

| Risk | Mitigation |
|---|---|
| ESLint fails on generated `payload-types.ts` / `importMap.js` | Add ignores to `eslint.config.mjs` before declaring lint clean |
| Next 16 defaults to Turbopack; `withPayload` may not cooperate | Verify `next dev`; fall back to webpack for build if needed |
| Payload docs assume ESM `next.config.js`; this project uses `next.config.ts` | Next 16 compiles TS config natively — verify empirically, rename to `.mjs` only if it actually breaks |
| Root layout move breaks font variables or JSON-LD | Layout file content is moved unmodified; verified by diffing rendered HTML `<head>` |
| Build now fails without Docker | Documented in AGENTS.md and README; `with-db.sh` fails loudly rather than silently |
| `git mv` of the app dir produces a confusing diff | Move in its own commit, separate from Payload additions |

## Open items (deliberately deferred)

- Which `site.ts` exports, if any, eventually become Payload collections.
- Hosted Postgres for deployment.
- Whether the admin panel should be behind additional access control before going live.
