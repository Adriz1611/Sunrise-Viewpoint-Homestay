import type { Payload } from "payload";

/**
 * Carried over verbatim from ACCOMMODATIONS in src/lib/site.ts as of
 * 2026-07-25. Provenance: the client's own info sheet, and the client's own
 * photographs in public/images. These are the three accommodation types the
 * homestay offers — four-sharing rooms, six-sharing rooms and camping tents,
 * and nothing else.
 *
 * Alt text is not repeated here: it lives on each Media document (see
 * src/seed/media.ts) so it is never duplicated per usage.
 */
export async function seedRooms(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "rooms", depth: 0 });
  if (existing?.items?.length) {
    payload.logger.info("seed: rooms already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "rooms",
    data: {
      title: "Eight rooms and camping tents. All of them face *east*.",
      items: [
        {
          name: "4-Sharing Rooms",
          count: "6 rooms",
          occupancy: "up to 4 guests per room",
          tagline:
            "Simple, spotless rooms built into the tea garden slope. Every room has an attached hot-water bath.",
          features: [
            { value: "Attached bath, hot water" },
            { value: "Tea-garden views" },
            { value: "Extra bedding on request" },
            { value: "Suited to couples & small families" },
          ],
          image: media["four-occupancy.jpeg"],
        },
        {
          name: "6-Sharing Rooms",
          count: "2 rooms",
          occupancy: "up to 6 guests per room",
          tagline:
            "Larger rooms that sleep up to six, for families and groups travelling together.",
          features: [
            { value: "Three beds, sleeps up to 6" },
            { value: "Attached bath, hot water" },
            { value: "Mountain-facing windows" },
            { value: "Best value for groups" },
          ],
          image: media["six-person-occupancy.jpeg"],
        },
        {
          name: "Camping Tents",
          count: "pitched on request",
          occupancy: "3–4 guests per tent (larger tents on request)",
          tagline:
            "Tents pitched right on the ridge, next to the sunrise viewpoint.",
          features: [
            { value: "Common washroom" },
            { value: "Bedding provided" },
            { value: "Larger tents for groups on request" },
            { value: "Best for first light at 5:30 AM" },
          ],
          image: media["Tent.jpeg"],
        },
      ],
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: rooms populated");
}
