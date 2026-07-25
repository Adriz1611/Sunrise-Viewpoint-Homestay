import { draftMode } from "next/headers";

/**
 * Clears the draft-mode bypass cookie so `/` is served from the static cache
 * again. Useful for getting out of preview without closing the browser.
 */
export async function GET() {
  const draft = await draftMode();
  draft.disable();
  return new Response("Draft mode disabled.");
}
