import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Guards against rendering a global that was never seeded — an empty admin
 * would otherwise render as a blank page with no explanation.
 *
 * Only ever called on the published path. Payload sets `skipValidation` when
 * saving a draft (`payload/dist/globals/operations/update.js`), so a required
 * field can legitimately be empty in a draft. Throwing here on a draft read
 * would 500 the preview render, which unmounts the live-preview subscriber and
 * leaves the pane permanently dead — no keystroke can bring it back. An empty
 * draft field is the client's business; only an empty *published* global is a
 * setup error. Tasks 6-9 follow the same `if (!draft)` shape.
 */
function assertPopulated(value: unknown, slug: string): void {
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Payload global "${slug}" has no content. Run \`npm run seed\` to populate it from src/lib/site.ts.`
    );
  }
}

/**
 * depth: 1 populates upload relationships with their url and alt. Forgetting it
 * is caught universally at the point of use by `mediaProps` (src/lib/media.ts),
 * which throws on a bare relationship id — so no fetcher here needs a
 * per-image assertion, including for array-nested images.
 *
 * overrideAccess is only needed for draft reads, which happen behind the
 * preview secret.
 */
export const getSiteSettings = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "site-settings",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  if (!draft) assertPopulated(doc.bookingPhones?.[0]?.number, "site-settings");
  return doc;
});

export const getHero = cache(async (draft: boolean) => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "hero",
    draft,
    depth: 1,
    overrideAccess: draft,
  });
  if (!draft) assertPopulated(doc.headlineLine1, "hero");
  return doc;
});
