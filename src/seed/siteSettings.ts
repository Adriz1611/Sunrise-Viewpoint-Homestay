import type { Payload } from "payload";

/**
 * Values carried over verbatim from CONTACT, TRANSPORT_CONTACT and META in
 * src/lib/site.ts as of 2026-07-25.
 *
 * Provenance: the homestay's own info sheet ("Sunrise Viewpoint Homestay.md",
 * provided by the client). The altitude keeps its "≈" because it could not be
 * verified exactly.
 */
export async function seedSiteSettings(payload: Payload): Promise<void> {
  const existing = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  if (existing?.bookingPhones?.length) {
    payload.logger.info("seed: site-settings already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      bookingPhones: [
        { label: "Bookings", number: "+91 98006 37784" },
        { label: "Bookings (alt.)", number: "+91 70195 92753" },
      ],
      transportName: "Gopal Chhetri",
      transportPhones: [
        { number: "+91 94746 80915" },
        { number: "+91 89186 78841" },
      ],
      coordinates: "26.9369° N, 88.4039° E",
      altitude: "≈ 4,200 ft",
      region: "Aahal Dara, Sittong III · Darjeeling Hills",
      address:
        "Aahal Dara, Sittong III, Kurseong, Darjeeling District, West Bengal 734008",
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: site-settings populated");
}
