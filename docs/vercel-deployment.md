# Vercel deployment

This project is compatible with Vercel's ephemeral filesystem:

- Payload Media uploads use Vercel Blob when `BLOB_READ_WRITE_TOKEN` exists.
- The production build does not start Docker. It connects to the configured
  Postgres database during the build.
- Local development still uses Docker through `npm run dev`.

## 1. Create the Vercel project

1. Import the repository into Vercel.
2. Set the framework to Next.js and keep the default build output settings.
3. Do not set a custom install command.
4. Use `npm run build` as the build command. Do not use `npm run build:local`;
   that command intentionally starts Docker and is for local verification only.

## 2. Create Prisma Postgres

In the Vercel project, open **Storage → Marketplace** and connect **Prisma
Postgres** (the free tier is subject to Prisma/Vercel's current plan limits).
Create or select the database and choose the environments to connect.

Prisma provides two PostgreSQL URLs:

- The pooled URL is for application/runtime queries.
- The direct URL is for migrations and other session-oriented tooling.

Payload's `postgresAdapter` accepts `DATABASE_URI`, `DATABASE_URL`, or
`POSTGRES_URL`; use `DATABASE_URI` explicitly so the deployment is unambiguous.
Map the Prisma pooled connection string to it. Keep the direct URL in
`DIRECT_DATABASE_URI` for migrations:

```text
DATABASE_URI=postgres://...pooled...?...sslmode=require
DIRECT_DATABASE_URI=postgres://...direct...?...sslmode=require
```

The URLs must remain secret. Add them in Vercel's Environment Variables for
**Production**, and add them to **Preview** too if preview deployments should
use the database.

## 3. Add required Vercel environment variables

Add these variables in Vercel:

```text
DATABASE_URI=<Prisma pooled Postgres URL>
DIRECT_DATABASE_URI=<Prisma direct Postgres URL>
PAYLOAD_SECRET=<long random secret>
PREVIEW_SECRET=<different long random secret>
NEXT_PUBLIC_SERVER_URL=https://your-production-domain.example
```

`NEXT_PUBLIC_SERVER_URL` must be the exact origin used by the admin and must
not include a path or trailing slash. For a preview deployment, use that
deployment's origin only if you intend to use Live Preview there.

## 4. Connect Vercel Blob

1. Open **Storage → Blob** in the Vercel project.
2. Create a Blob store with **Public** access. Payload's Vercel Blob adapter
   currently requires public access for generated image URLs.
3. Connect the store to the project and environment.
4. Confirm Vercel created `BLOB_READ_WRITE_TOKEN`.

The Payload config enables the adapter for the `media` collection and uses
client uploads, which avoids Vercel's 4.5 MB server request limit.

## 5. Create the database schema

The existing Payload Postgres adapter manages the schema. Run migrations from
a machine or CI job that can reach Prisma Postgres, using the direct URL:

```powershell
$env:DATABASE_URI = '<Prisma direct URL>'
npx payload migrate
```

If this is a brand-new database and the project has no migration files yet,
run the first deployment once with the database connected so Payload can push
the schema in its normal initialization flow, then generate/commit a migration
for repeatable deployments:

```powershell
npx payload migrate:create
npx payload migrate
```

Do not run migrations against the pooled URL. Use the direct Prisma URL for
migrations and admin tooling.

## 6. Seed content and inventory once

After the schema exists, run the seed against the production database from a
trusted local machine or CI job. Use the direct URL for this one-time command:

```powershell
$env:DATABASE_URI = '<Prisma direct URL>'
npm run seed:remote
```

`seed:remote` does not start Docker. The seed is idempotent. It uploads the
source images into the connected Blob store and creates the Payload globals and
room inventory without overwriting existing client edits. Keep `npm run seed`
for local Docker-backed development.

For an existing local database, do not assume old Media records are already in
Blob. Verify each existing Media document has a Blob-backed URL, or upload the
source files again in `/admin` before switching traffic to Vercel.

## 7. Deploy and verify

Deploy after the environment variables and schema are ready. Verify:

1. `/` renders without a database error.
2. `/admin` accepts the first user/login.
3. An image uploaded in **Media** survives a redeploy.
4. A global edit revalidates the homepage.
5. `/next/preview?secret=...&preview=hero` opens Live Preview.
6. Preview and production use the intended environment variables.

Vercel environment-variable changes require a new deployment to take effect.
