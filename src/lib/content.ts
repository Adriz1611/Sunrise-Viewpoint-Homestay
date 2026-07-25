import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

function assertPopulated(value: unknown, slug: string): void {
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Payload global "${slug}" has no content. Run \`npm run seed\` to populate it from src/lib/site.ts.`
    );
  }
}

/**
 * Catches a forgotten `depth: 1`: an unpopulated upload arrives as a bare
 * relationship id (a number, or a string of digits from the REST layer) rather
 * than a Media document, and would silently render as an empty slot.
 *
 * null/undefined deliberately passes. An empty upload field is legitimate —
 * Payload skips required-field validation on save-as-draft, so a draft read can
 * and does return null, and the frontend renders an empty slot for it (see
 * src/lib/media.ts). Only a *wrongly shaped* value is a bug worth throwing on.
 */
function assertMediaPopulated(value: unknown, context: string): void {
  const isBareId =
    typeof value === "number" ||
    (typeof value === "string" && /^\d+$/.test(value));
  if (isBareId) {
    throw new Error(
      `${context}: image came back as a relationship id, not a document. Fetch the global with depth: 1.`
    );
  }
}

/**
 * depth: 1 populates upload relationships with their url and alt.
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
  assertPopulated(doc.bookingPhones?.[0]?.number, "site-settings");
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
  assertPopulated(doc.headlineLine1, "hero");
  assertMediaPopulated(doc.backgroundImage, "hero.backgroundImage");
  return doc;
});
