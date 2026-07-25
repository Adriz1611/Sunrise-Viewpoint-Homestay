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
  return doc;
});
