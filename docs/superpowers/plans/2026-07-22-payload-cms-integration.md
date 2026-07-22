# Payload CMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Payload CMS 3.86.0 to the existing Sunrise Viewpoint Homestay Next.js site — working admin panel at `/admin`, MCP server at `/api/mcp`, and Payload's agent skills — without changing a single pixel of the public marketing page.

**Architecture:** Split `src/app` into `(frontend)` and `(payload)` route groups; Payload config and collections live under `src/`; Postgres runs in Docker on port 5433 with its lifecycle bound to the dev/build command via a `scripts/with-db.sh` wrapper. `src/lib/site.ts` is not touched and remains the source of truth for all homestay facts.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, Payload 3.86.0, `@payloadcms/db-postgres`, `@payloadcms/plugin-mcp`, Lexical, Postgres 17 (Docker), Tailwind v4, GSAP/Lenis.

**Spec:** `docs/superpowers/specs/2026-07-22-payload-cms-integration-design.md`

## Global Constraints

- **Every Payload package must be exactly `3.86.0`.** Mismatched Payload package versions fail at runtime with opaque errors.
- **`src/lib/site.ts` must not be modified.** It is the single source of truth for every homestay fact (prices, phone numbers, distances) per AGENTS.md. Payload collections must not become a second source of truth.
- **`src/app/(frontend)/layout.tsx` and `src/app/(frontend)/page.tsx` must never contain `"use client"`.** All GSAP/Lenis animation stays in leaf client components. This already holds and must be preserved.
- **`public/images/hero-kanchenjunga.jpg` must not be changed or replaced.**
- **`next.config.ts` must keep `poweredByHeader: false` and the entire existing `images` block** — the `images.unsplash.com` `remotePatterns` entry, `formats`, and `minimumCacheTTL`. AGENTS.md depends on that allowlist; without it every stock photo breaks.
- **Do NOT add `images.localPatterns`.** Next allows all local paths by default; specifying `localPatterns` *restricts* to only the listed patterns, which would break `/images/hero-kanchenjunga.jpg`. Payload's blank template sets it because that template has no local images.
- **Verification after every task:** `npm run lint` and `npm run build` must both pass clean. There is no unit test suite in this project — lint and the type-checking build are the only automated signal, so neither may be skipped.
- **Never commit `.env`** (already covered by `.env*` in `.gitignore`) and never write a live MCP API key into any tracked file.
- Design tokens, fonts, and the dark palette are out of scope — do not touch `src/app/globals.css` beyond moving it.

## File Structure

**Created:**
- `docker-compose.yml` — Postgres 17 service, host port 5433, healthcheck, named volume
- `scripts/with-db.sh` — starts Postgres, runs a command, stops Postgres on exit
- `.env` — untracked; `DATABASE_URI` + `PAYLOAD_SECRET`
- `.env.example` — tracked; same keys, placeholder values
- `src/payload.config.ts` — Payload config (postgres adapter, Lexical, MCP plugin)
- `src/collections/Users.ts` — auth collection
- `src/collections/Media.ts` — upload collection
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/custom.scss`
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(payload)/api/graphql/route.ts`
- `src/app/(payload)/api/graphql-playground/route.ts`
- `src/app/(payload)/admin/importMap.js` — **generated**, never hand-written
- `src/payload-types.ts` — **generated**, never hand-written

**Moved (`git mv`, contents unmodified):**
- `src/app/{layout.tsx,page.tsx,globals.css,favicon.ico,sitemap.ts,robots.ts}` → `src/app/(frontend)/`

**Modified:**
- `package.json` — add `"type": "module"`, dependencies, scripts
- `tsconfig.json` — `@payload-config` path, ES2022 target/lib
- `next.config.ts` — wrap in `withPayload`, add `turbopack.root`
- `eslint.config.mjs` — ignore generated files
- `AGENTS.md`, `README.md` — document the new structure and Docker dependency

**Untouched:** all of `src/components/`, all of `src/lib/`, `public/`, `postcss.config.mjs`.

---

### Task 1: Postgres container and dev lifecycle wrapper

Standalone and independently testable — no Payload code involved yet. Delivers a database that starts with the dev server and stops with it.

**Files:**
- Create: `docker-compose.yml`
- Create: `scripts/with-db.sh`
- Create: `.env`, `.env.example`
- Modify: `package.json` (scripts only)

**Interfaces:**
- Consumes: nothing.
- Produces: a reachable Postgres at `postgres://payload:payload@localhost:5433/sunrise_viewpoint`, exposed to later tasks as the env var `DATABASE_URI`. `scripts/with-db.sh <cmd...>` runs any command with the DB up. npm scripts `db:up`, `db:down`.

- [ ] **Step 1: Confirm port 5433 is free**

```bash
ss -ltn | grep -E ':(5432|5433)\b' || echo "BOTH PORTS FREE"
```

Expected: `BOTH PORTS FREE`. If 5433 is occupied, pick 5434 and use it consistently everywhere below.

- [ ] **Step 2: Create `docker-compose.yml`**

No `version:` key — it is obsolete in Compose v2 and emits a warning.

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: sunrise-viewpoint-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: payload
      POSTGRES_DB: sunrise_viewpoint
    ports:
      # Host 5433 avoids colliding with any system Postgres on 5432.
      - '5433:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U payload -d sunrise_viewpoint']
      interval: 2s
      timeout: 3s
      retries: 15

volumes:
  pgdata:
```

- [ ] **Step 3: Create `scripts/with-db.sh`**

```bash
#!/usr/bin/env bash
# Runs a command with the Payload Postgres container up for its lifetime,
# then stops the container when the command exits (including on Ctrl-C).
# `stop` rather than `down` so the pgdata volume survives.
set -euo pipefail

cd "$(dirname "$0")/.."

cleanup() {
  docker compose stop -t 5 >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker compose up -d --wait

"$@"
```

Note: `"$@"` rather than `exec "$@"` — `exec` would replace the shell and the `trap` would never fire, leaving the container running.

- [ ] **Step 4: Make it executable and commit the bit**

```bash
chmod +x scripts/with-db.sh
git update-index --chmod=+x scripts/with-db.sh 2>/dev/null || true
```

- [ ] **Step 5: Create `.env.example` (tracked)**

```
# Local Postgres from docker-compose.yml (host port 5433).
DATABASE_URI=postgres://payload:payload@localhost:5433/sunrise_viewpoint
# Generate with: openssl rand -hex 32
PAYLOAD_SECRET=replace_me_with_a_32_byte_hex_secret
```

- [ ] **Step 6: Create `.env` (untracked) with a real secret**

```bash
printf 'DATABASE_URI=postgres://payload:payload@localhost:5433/sunrise_viewpoint\nPAYLOAD_SECRET=%s\n' "$(openssl rand -hex 32)" > .env
git check-ignore -v .env
```

Expected: `git check-ignore` prints a line naming `.gitignore` and the `.env*` rule, proving the file will not be committed. If it prints nothing, STOP — the file is trackable and must not be created until `.gitignore` is fixed.

- [ ] **Step 7: Add the db scripts to `package.json`**

Only `db:up` / `db:down` in this task; `dev` and `build` are rewired in Task 3 once Payload actually needs the DB.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:up": "docker compose up -d --wait",
  "db:down": "docker compose stop"
}
```

- [ ] **Step 8: Verify the container starts and is healthy**

```bash
npm run db:up && docker compose ps
```

Expected: the `postgres` service shows `Up` and `(healthy)`.

- [ ] **Step 9: Verify the lifecycle wrapper actually stops the container**

```bash
./scripts/with-db.sh sleep 2 && docker compose ps
```

Expected: the command exits 0, then `docker compose ps` shows the service `Exited` (or lists no running service). If it still shows `Up`, the trap is not firing — fix before continuing.

- [ ] **Step 10: Verify the existing site is still untouched**

```bash
npm run lint && npm run build
```

Expected: both pass clean.

- [ ] **Step 11: Commit**

```bash
git add docker-compose.yml scripts/with-db.sh .env.example package.json
git commit -m "Add dockerized Postgres with dev-lifecycle wrapper script"
```

---

### Task 2: Route-group restructure

Pure file move, no Payload code. Isolating it keeps the rename diff readable and proves the site survives the move on its own.

**Files:**
- Move: `src/app/layout.tsx` → `src/app/(frontend)/layout.tsx`
- Move: `src/app/page.tsx` → `src/app/(frontend)/page.tsx`
- Move: `src/app/globals.css` → `src/app/(frontend)/globals.css`
- Move: `src/app/favicon.ico` → `src/app/(frontend)/favicon.ico`
- Move: `src/app/sitemap.ts` → `src/app/(frontend)/sitemap.ts`
- Move: `src/app/robots.ts` → `src/app/(frontend)/robots.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: an empty `src/app/` root with a single `(frontend)` route group, leaving room for `(payload)` in Task 4. Public URLs `/`, `/sitemap.xml`, `/robots.txt` are unchanged because route groups do not affect routing.

- [ ] **Step 1: Capture the current rendered output as a baseline**

```bash
npm run build > /tmp/build-before.txt 2>&1; tail -30 /tmp/build-before.txt
```

Expected: build succeeds. Note the route table — it should list `/`, `/robots.txt`, `/sitemap.xml`. Keep this file for comparison in Step 5.

- [ ] **Step 2: Move the files**

`git mv` preserves rename detection so the diff shows moves, not delete+add.

```bash
mkdir -p "src/app/(frontend)"
git mv src/app/layout.tsx "src/app/(frontend)/layout.tsx"
git mv src/app/page.tsx "src/app/(frontend)/page.tsx"
git mv src/app/globals.css "src/app/(frontend)/globals.css"
git mv src/app/favicon.ico "src/app/(frontend)/favicon.ico"
git mv src/app/sitemap.ts "src/app/(frontend)/sitemap.ts"
git mv src/app/robots.ts "src/app/(frontend)/robots.ts"
ls -a src/app
```

Expected: `src/app` now contains only `.`, `..`, and `(frontend)`.

- [ ] **Step 3: Confirm no import paths need changing**

`layout.tsx` imports `./globals.css` (relative, moved together) and `@/lib/site` (alias, unaffected). `page.tsx` imports only `@/components/*`.

```bash
grep -rn "from \"\./\|from '\./" "src/app/(frontend)/"
```

Expected: only `./globals.css` in `layout.tsx`. Any other relative import must be re-pointed; there should be none.

- [ ] **Step 4: Confirm the server-component invariant still holds**

```bash
grep -l "use client" "src/app/(frontend)/layout.tsx" "src/app/(frontend)/page.tsx" && echo "FAIL: use client present" || echo "PASS: both are server components"
```

Expected: `PASS: both are server components`.

- [ ] **Step 5: Verify build output matches the baseline**

```bash
npm run lint && npm run build > /tmp/build-after.txt 2>&1; tail -30 /tmp/build-after.txt
```

Expected: lint clean, build succeeds, and the route table still lists `/`, `/robots.txt`, `/sitemap.xml` with the same rendering strategy as `/tmp/build-before.txt`.

- [ ] **Step 6: Verify the live pages still respond**

```bash
npm run dev &
sleep 12
for p in / /sitemap.xml /robots.txt; do printf '%s -> ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000$p"; done
curl -s http://localhost:3000/ | grep -c "Sunrise Viewpoint Homestay"
kill %1
```

Expected: `200` for all three paths, and the grep count is at least 1.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Move frontend into (frontend) route group for Payload"
```

---

### Task 3: Install Payload and wire up configuration

Packages, config files, and build tooling. Ends with a config that type-checks even though the admin routes do not exist yet.

**Files:**
- Modify: `package.json` (add `"type": "module"`, dependencies, rewire `dev`/`build`)
- Modify: `tsconfig.json` (add `@payload-config`, bump target/lib to ES2022)
- Modify: `next.config.ts` (wrap in `withPayload`)
- Modify: `eslint.config.mjs` (ignore generated files)
- Create: `src/payload.config.ts`
- Create: `src/collections/Users.ts`
- Create: `src/collections/Media.ts`

**Interfaces:**
- Consumes: `DATABASE_URI` and `PAYLOAD_SECRET` from Task 1's `.env`; `scripts/with-db.sh` from Task 1.
- Produces: a default-exported Payload config resolvable as `@payload-config`, with collection slugs `users` and `media`. `Users.slug === 'users'`, `Media.slug === 'media'`. Task 4's route files import `config from '@payload-config'`.

- [ ] **Step 1: Install the packages, all pinned to 3.86.0**

```bash
npm install payload@3.86.0 @payloadcms/next@3.86.0 @payloadcms/ui@3.86.0 @payloadcms/db-postgres@3.86.0 @payloadcms/richtext-lexical@3.86.0 @payloadcms/plugin-mcp@3.86.0 graphql@^16.8.1 sharp@^0.34.2
```

`@payloadcms/ui` is required because the generated `importMap.js` imports from it directly. `graphql` and `sharp` are required by the config.

- [ ] **Step 2: Verify every Payload package resolved to the same version**

```bash
npm ls payload @payloadcms/next @payloadcms/ui @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/plugin-mcp 2>&1 | grep -E "payload|@payloadcms"
```

Expected: every line ends in `3.86.0`, and there are no `UNMET DEPENDENCY` or `invalid` markers.

- [ ] **Step 3: Add `"type": "module"` to `package.json`**

Required: `src/payload.config.ts` uses `import.meta.url`, and the generated `src/app/(payload)/admin/importMap.js` is an ESM `.js` file that will be parsed as CommonJS and throw `Cannot use import statement outside a module` without it.

Insert immediately after the `"private": true,` line:

```json
  "type": "module",
```

- [ ] **Step 4: Rewire `dev` and `build` through the DB wrapper**

Payload connects to Postgres during both dev and build, so both need the container up.

```json
"scripts": {
  "dev": "./scripts/with-db.sh next dev",
  "build": "./scripts/with-db.sh next build",
  "start": "next start",
  "lint": "eslint",
  "db:up": "docker compose up -d --wait",
  "db:down": "docker compose stop",
  "payload": "payload",
  "generate:types": "./scripts/with-db.sh payload generate:types",
  "generate:importmap": "./scripts/with-db.sh payload generate:importmap"
}
```

- [ ] **Step 5: Update `tsconfig.json`**

Two changes: add the `@payload-config` path alongside the existing `@/*`, and raise `target`/`lib` from ES2017 to ES2022 (Payload's packages ship ES2022 syntax). Everything else stays as-is, including `"**/*.mts"` in `include`.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@payload-config": ["./src/payload.config.ts"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5b: Update `next.config.ts`**

Existing settings are preserved exactly. `turbopack.root` is added because Next 16 defaults to Turbopack and Payload's monorepo-style deps otherwise cause root inference warnings. `localPatterns` is deliberately omitted — see Global Constraints.

```typescript
import path from "path";
import { fileURLToPath } from "url";

import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
```

- [ ] **Step 5c: Update `eslint.config.mjs` to ignore generated files**

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated by Payload — never hand-edited, so never linted.
    "src/payload-types.ts",
    "src/app/(payload)/admin/importMap.js",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 6: Create `src/collections/Users.ts`**

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email and password are added by the auth config.
  ],
  versions: false,
}
```

- [ ] **Step 7: Create `src/collections/Media.ts`**

Payload's blank template adds `createFolderField`/`createTagField` here, which require `Folders` and `Tags` collections. Those are omitted — this scaffold has only two collections.

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
```

- [ ] **Step 8: Create `src/payload.config.ts`**

Note `DATABASE_URI` (matching Task 1's `.env`), not the `DATABASE_URL` used by Payload's Mongo-based blank template.

```typescript
import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [mcpPlugin({})],
})
```

- [ ] **Step 9: Generate types and confirm the DB connection works**

```bash
npm run generate:types
ls -l src/payload-types.ts
```

Expected: the command connects to Postgres, prints that types were generated, and `src/payload-types.ts` exists containing `export interface User` and `export interface Media`. If it fails with a connection error, confirm `docker compose ps` shows healthy and that `DATABASE_URI` in `.env` uses port **5433**.

- [ ] **Step 10: Verify lint and build still pass**

```bash
npm run lint && npm run build
```

Expected: both clean. The site builds with Payload installed but no admin routes yet.

If `next build` fails with an import-map or generated-types error, regenerate both and retry once:

```bash
npm run generate:importmap && npm run generate:types && npm run build
```

If it still fails, switch the `build` script to Payload's own wrapper, which sequences generation before the Next build:

```json
"build": "./scripts/with-db.sh payload build"
```

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs src/payload.config.ts src/collections src/payload-types.ts
git commit -m "Install Payload 3.86.0 with Postgres adapter and MCP plugin"
```

---

### Task 4: Add the (payload) route group and bring up the admin panel

**Files:**
- Create: `src/app/(payload)/layout.tsx`
- Create: `src/app/(payload)/custom.scss`
- Create: `src/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `src/app/(payload)/api/[...slug]/route.ts`
- Create: `src/app/(payload)/api/graphql/route.ts`
- Create: `src/app/(payload)/api/graphql-playground/route.ts`
- Generate: `src/app/(payload)/admin/importMap.js`

**Interfaces:**
- Consumes: `config` from `@payload-config` (Task 3), `importMap` from the generated `./admin/importMap.js`.
- Produces: routes `/admin`, `/api/[...slug]`, `/api/graphql`, `/api/graphql-playground`, `/api/mcp`. Task 5 depends on `/api/mcp` responding and on a user existing.

- [ ] **Step 1: Create the directories**

```bash
mkdir -p "src/app/(payload)/admin/[[...segments]]" "src/app/(payload)/api/[...slug]" "src/app/(payload)/api/graphql" "src/app/(payload)/api/graphql-playground"
```

- [ ] **Step 2: Create `src/app/(payload)/layout.tsx`**

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import {
  generatePayloadViewport,
  handleServerFunctions,
  RootLayout,
} from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

export const generateViewport = generatePayloadViewport

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```

- [ ] **Step 3: Create `src/app/(payload)/custom.scss` as an empty file**

```bash
touch "src/app/(payload)/custom.scss"
```

It is imported by the layout above and must exist, but the admin panel is deliberately left on Payload's default styling — the client's dark palette applies to the public site, not the CMS.

- [ ] **Step 4: Create `src/app/(payload)/admin/[[...segments]]/page.tsx`**

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
```

- [ ] **Step 5: Create `src/app/(payload)/admin/[[...segments]]/not-found.tsx`**

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, params, searchParams, importMap })

export default NotFound
```

- [ ] **Step 6: Create `src/app/(payload)/api/[...slug]/route.ts`**

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

- [ ] **Step 7: Create `src/app/(payload)/api/graphql/route.ts`**

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes'

export const POST = GRAPHQL_POST(config)

export const OPTIONS = REST_OPTIONS(config)
```

- [ ] **Step 8: Create `src/app/(payload)/api/graphql-playground/route.ts`**

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

export const GET = GRAPHQL_PLAYGROUND_GET(config)
```

- [ ] **Step 9: Generate the import map**

Do NOT copy `importMap.js` from Payload's template — its contents are derived from the collections in the config, and the template has `Folders` and `Tags` that this project does not.

```bash
npm run generate:importmap
cat "src/app/(payload)/admin/importMap.js"
```

Expected: the file exists and exports an `importMap` object. With only `Users` and `Media` it may legitimately be nearly empty — that is correct, not a failure.

- [ ] **Step 10: Verify lint and build**

```bash
npm run lint && npm run build
```

Expected: both clean. The build route table now additionally lists `/admin/[[...segments]]`, `/api/[...slug]`, `/api/graphql`, `/api/graphql-playground`, and `/api/mcp`.

- [ ] **Step 11: Verify the admin panel and the untouched public site**

```bash
npm run dev &
sleep 20
for p in / /sitemap.xml /robots.txt /admin; do printf '%s -> ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000$p"; done
printf '/api/mcp (no auth) -> '; curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/api/mcp
```

Expected: `200` for `/`, `/sitemap.xml`, `/robots.txt`; `200` (or a `307` to `/admin/create-first-user`) for `/admin`; and `401`/`403` for `/api/mcp`, which confirms the MCP endpoint exists and is correctly refusing unauthenticated requests.

- [ ] **Step 12: Create the first admin user (manual, in a browser)**

Visit `http://localhost:3000/admin`, complete the create-first-user form, and confirm the dashboard lists the **Users** and **Media** collections. Leave the dev server running for Task 5.

- [ ] **Step 13: Manual responsive and animation check**

Required by AGENTS.md for any layout change; there is no automated tooling. At desktop, laptop, tablet, and mobile widths on `http://localhost:3000/`, confirm:
- the Hero masked-headline reveal and backdrop zoom play on load;
- Lenis smooth scrolling is active;
- the `Rooms` pinned horizontal scroll works on lg+ and falls back to a vertical stack below;
- the `Experiences` sticky stacked cards recede correctly;
- the `Footer` clip-path reveal ends in its verified overlap-free position;
- the top ticker and testimonials marquees still cover a >2500px viewport without gaps.

- [ ] **Step 14: Commit**

```bash
git add "src/app/(payload)"
git commit -m "Add (payload) route group with admin panel and API routes"
```

---

### Task 5: Connect the MCP server, install Payload skills, and document

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Possibly create: skills directory (location determined by the `skills` CLI)

**Interfaces:**
- Consumes: a running dev server with `/api/mcp` from Task 4, and a first user from Task 4 Step 12.
- Produces: an MCP server registered with Claude Code under the name `Payload`; Payload's agent skills installed; documentation reflecting the new structure.

- [ ] **Step 1: Create an MCP API key (manual, in the browser)**

In the admin panel go to **MCP → API Keys**, create a key, and enable the desired capabilities for the `users` and `media` resources. Copy the key.

Access is deliberately two-step: a resource must be `enabled` in `payload.config.ts` *and* allowed on the key. `mcpPlugin({})` is currently configured with no collections enabled, so a fresh key grants nothing until collections are added — that is the safe default and is intentional for a scaffold.

- [ ] **Step 2: Register the MCP server with Claude Code**

Substitute the real key. This value is a live credential — it goes only into Claude Code's own MCP config, never into a tracked file in this repo.

```bash
claude mcp add --transport http Payload \
  http://127.0.0.1:3000/api/mcp \
  --header "Authorization: Bearer <PASTE-KEY-HERE>"
```

- [ ] **Step 3: Verify the MCP server is reachable**

```bash
claude mcp list
```

Expected: a `Payload` entry pointing at `http://127.0.0.1:3000/api/mcp`, reported as connected. If it reports failure, confirm the dev server is still running — the MCP endpoint only exists while Next is up.

- [ ] **Step 4: Install the Payload skills**

```bash
npx skills add payloadcms/skills
```

Expected: two skills installed — *Payload* (collections, fields, hooks, access control, queries, plugin development) and *CMS Migration*.

- [ ] **Step 5: Determine where the skills landed and handle them deliberately**

The `skills` CLI's install location is not documented, so inspect rather than assume.

```bash
git status --porcelain
```

If it introduced an untracked directory inside the repo, decide explicitly: commit it if the skills should be shared with anyone cloning the project, or add it to `.gitignore` if it is machine-local tooling. Do not leave it as an unexplained untracked directory.

- [ ] **Step 6: Add a Payload section to `AGENTS.md`**

Insert after the `## Images` section and before `## Verification`:

```markdown
## Payload CMS

- The admin panel lives at `/admin`, backed by `src/payload.config.ts` with collections
  in `src/collections/`. REST/GraphQL are at `/api/*`, and the MCP server at `/api/mcp`.
- `src/app` is split into two route groups: `(frontend)` holds the public marketing site
  (layout, page, globals.css, sitemap, robots), `(payload)` holds Payload's generated
  admin and API routes. Route groups do not affect URLs — `/`, `/sitemap.xml`, and
  `/robots.txt` are unchanged.
- **`src/lib/site.ts` is still the only source of truth for homestay facts.** Payload
  currently manages nothing but `Users` and `Media`. Do not treat a Payload collection
  as a second home for a price, phone number, or distance.
- `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js` are generated —
  never hand-edit them. Regenerate with `npm run generate:types` and
  `npm run generate:importmap`.
- Everything under `src/app/(payload)/` is generated by Payload and marked
  "DO NOT MODIFY" — treat it as vendored.
```

- [ ] **Step 7: Update the Verification section of `AGENTS.md`**

The build now has a hard Docker dependency, which contradicts the current instructions. Replace the `## Verification` intro so it reads:

```markdown
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
```

- [ ] **Step 8: Update `README.md`**

Add setup steps covering: copying `.env.example` to `.env` and generating a `PAYLOAD_SECRET` with `openssl rand -hex 32`; the Docker requirement; `npm run dev`; and creating the first user at `/admin`. Also note in the existing TODO list that Payload currently manages no site content.

- [ ] **Step 9: Final full verification**

```bash
npm run lint && npm run build
```

Expected: both pass clean.

- [ ] **Step 10: Confirm no secret is staged**

```bash
git status --porcelain
git diff --cached | grep -iE "PAYLOAD_SECRET=|Bearer " && echo "STOP: secret staged" || echo "OK: no secret staged"
```

Expected: `OK: no secret staged`, and `.env` does not appear in `git status`.

- [ ] **Step 11: Commit**

```bash
git add AGENTS.md README.md
git commit -m "Document Payload setup, route groups, and Docker build dependency"
```

---

## Post-implementation review checklist

- [ ] `/`, `/sitemap.xml`, `/robots.txt` render identically to before the change.
- [ ] `src/lib/site.ts` shows zero diff across the whole branch: `git diff main -- src/lib/site.ts` is empty.
- [ ] `public/images/hero-kanchenjunga.jpg` is unchanged.
- [ ] `next.config.ts` still allowlists `images.unsplash.com` and has no `localPatterns`.
- [ ] `(frontend)/layout.tsx` and `(frontend)/page.tsx` contain no `"use client"`.
- [ ] `npm run dev`, then Ctrl-C, leaves no running Postgres container.
- [ ] `.env` is untracked; no API key or secret appears anywhere in git history.
