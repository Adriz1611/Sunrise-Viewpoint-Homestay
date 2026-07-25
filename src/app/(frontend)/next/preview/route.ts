import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * Entry point for Payload's Live Preview iframe. The admin points at
 * `/next/preview?secret=…&preview=<slug>` (see src/globals/livePreview.ts);
 * this validates the secret, turns on Next draft mode so the homepage reads
 * unpublished versions, and forwards to `/` carrying the section slug.
 *
 * Lives under `(frontend)` because `src/app/(payload)/` is generated and must
 * not be touched. Route groups do not affect URLs, so this serves
 * `/next/preview`.
 */
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

  // redirect() signals by throwing, so it must stay outside any try/catch.
  redirect(`/?preview=${encodeURIComponent(preview)}`);
}
