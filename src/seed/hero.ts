import type { Payload } from "payload";

/**
 * Copy carried over verbatim from src/components/Hero.tsx as of 2026-07-25.
 * Provenance: the client's own info sheet. The backdrop is the client's own
 * photograph — do not change this default.
 */
export async function seedHero(
  payload: Payload,
  media: Record<string, number>
): Promise<void> {
  const existing = await payload.findGlobal({ slug: "hero", depth: 0 });
  if (existing?.headlineLine1) {
    payload.logger.info("seed: hero already populated, skipping");
    return;
  }

  await payload.updateGlobal({
    slug: "hero",
    data: {
      backgroundImage: media["hero-kanchenjunga.jpg"],
      headlineLine1: "Sunrise",
      headlineLine2: "Viewpoint",
      headlineAccent: ".",
      subhead:
        "A family-run homestay on the Aahaldara ridge, with a 180° sunrise view of the Kanchenjunga range and the Teesta valley far below.",
      ctaLabel: "Call to book",
      _status: "published",
    },
    context: { disableRevalidate: true },
  });

  payload.logger.info("seed: hero populated");
}
