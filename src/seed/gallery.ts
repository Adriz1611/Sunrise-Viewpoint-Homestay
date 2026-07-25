import type { Payload } from "payload";

/**
 * Carried over verbatim from GALLERY in src/lib/site.ts as of 2026-07-25.
 * Provenance: the client's own photographs, named for their captions, except
 * "Light through the pines" and "A home-cooked spread", which are still
 * curated Unsplash stock because the client has not supplied photographs for
 * those captions — swap them when they arrive.
 *
 * Order matters: "First light over the hills" is last on purpose, because the
 * last slot renders full width. Give it a landscape, not an interior.
 */
export async function seedGallery(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "gallery", depth: 0 });
  if (existing?.photos?.length) {
    payload.logger.info("seed: gallery already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "gallery",
    data: {
      title: "Scenes from the ridge, through the seasons.",
      photos: [
        {
          image: media["morningontheridge.jpg"],
          caption: "Morning on the ridge",
        },
        {
          image: media["Thehighrangecleardayview.jpg"],
          caption: "The high range, clear-day view",
        },
        { image: media["pines"], caption: "Light through the pines" },
        { image: media["spread"], caption: "A home-cooked spread" },
        { image: media["teafromthehills.jpg"], caption: "Tea from the hills" },
        {
          image: media["firstlightoverthehills.jpg"],
          caption: "First light over the hills",
        },
      ],
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: gallery populated");
}
