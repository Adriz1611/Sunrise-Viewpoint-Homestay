import type { Payload } from "payload";

/**
 * Carried over verbatim from EXPERIENCES in src/lib/site.ts as of 2026-07-25.
 * Provenance: distances, altitudes and seasons come from the client's own info
 * sheet. Images are the client's own photographs, except "Nights built for
 * stargazing", which is still curated Unsplash stock because the client has
 * not supplied a night-sky photograph — swap it when one arrives. The "≈"
 * prefixes mark figures that could not be verified exactly; keep them.
 */
export async function seedExperiences(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "experiences", depth: 0 });
  if (existing?.items?.length) {
    payload.logger.info("seed: experiences already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "experiences",
    data: {
      title: "Six things worth leaving the veranda for.",
      cardFooterLabel: "Aahaldara · Sittong III",
      items: [
        {
          title: "Sunrise from the hotel",
          body: "First light straight from the homestay — the sun coming up over the ridge and the tents, the Kanchenjunga range catching the earliest colour. It is what the homestay is named for.",
          image: media["Sunrise.jpg"],
        },
        {
          title: "Nights built for stargazing",
          body: "Clear high-altitude skies with almost no light pollution. The stargazing is best on cold, moonless nights.",
          image: media["stargazing"],
        },
        {
          title: "Namthing Pokhari",
          body: "A pine-ringed lake ≈2 km away at nearly 4,000 ft, home to the endangered Himalayan salamander. Best June–September, when the monsoon greens the forest.",
          image: media["NamthingPokhari.jpg"],
        },
        {
          title: "Birding in Latpanchar",
          body: "Inside the Mahananda Wildlife Sanctuary, ≈5 km away at ≈4,200 ft. Home to over 200 bird species, including the rufous-necked hornbill. Best October–April.",
          image: media["BirdinginLatpanchar.jpg"],
        },
        {
          title: "Sittong's orange orchards",
          body: '≈2 km down the ridge, the "Orange Village of West Bengal" turns amber October–February, peaking from late December to February.',
          image: media["SittongOraneOrchards.jpg"],
        },
        {
          title: "The Teesta below",
          body: "On clear days, the Teesta river's emerald-green thread is visible in the valley far below. The view shifts with the weather through the day.",
          image: media["teestariverfromtop.jpg"],
        },
      ],
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: experiences populated");
}
