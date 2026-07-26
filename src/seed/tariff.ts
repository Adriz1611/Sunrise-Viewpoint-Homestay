import type { Payload } from "payload";

/**
 * Carried over from TARIFF, TARIFF_NOTES, MEALS_INCLUDED, MEALS_EXTRA and
 * STAY_INFO in src/lib/site.ts as of 2026-07-25.
 * Provenance: per-person, per-night rates come from the
 * nexttripbooking.com / bookingnexttrip.com listings for this property (see
 * README); meals and check-in times come from the client's own info sheet.
 * The room-type sequence (4-Sharing, 6-Sharing, Camping tent) was confirmed
 * by the client on 2026-07-26. Rates can change seasonally — confirm by phone
 * before publishing.
 */
export async function seedTariff(payload: Payload): Promise<void> {
  const existing = await payload.findGlobal({ slug: "tariff", depth: 0 });
  if (existing?.rates?.length) {
    payload.logger.info("seed: tariff already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "tariff",
    data: {
      title: "One per-person price, *meals included*.",
      rates: [
        { name: "4-Sharing", amount: 1500, unit: "per person / night" },
        { name: "6-Sharing", amount: 1400, unit: "per person / night" },
        {
          name: "Camping tent",
          amount: 1200,
          unit: "per person / night",
          note: "common washroom",
        },
      ],
      rateDisclaimer:
        "Rates shown are approximate and may change by season. Please call the homestay to confirm the current tariff before booking.",
      mealsIncluded: [
        { value: "Morning tea" },
        { value: "Breakfast" },
        { value: "Lunch" },
        { value: "Evening tea & snacks" },
        { value: "Dinner" },
      ],
      mealsExtra: [
        { value: "Barbecue (BBQ)" },
        { value: "Extra snacks" },
        { value: "Special dishes" },
      ],
      checkIn: "12:00 PM",
      checkOut: "11:00 AM",
      firstLight: "05:30 IST",
      notes: [
        { value: "Tariff includes morning tea, breakfast, lunch, evening tea & snacks, dinner." },
        { value: "Barbecue (BBQ), Extra snacks, Special dishes available on request at extra cost." },
        { value: "Check-in from 12:00 PM · Check-out by 11:00 AM." },
        { value: "Call ahead to confirm current rates and availability." },
      ],
      reserveHeading: "One phone call is all it takes.",
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: tariff populated");
}
