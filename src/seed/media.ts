import fs from "node:fs/promises";
import path from "node:path";
import type { Payload } from "payload";

/**
 * Alt text for the client's own photographs, carried over verbatim from the
 * imageAlt fields in src/lib/site.ts as of 2026-07-25. Provenance: the
 * client's own photographs, supplied with the info sheet, stored in
 * public/images and named for where they belong.
 */
const LOCAL_IMAGES: { file: string; alt: string }[] = [
  {
    file: "hero-kanchenjunga.jpg",
    alt: "The Kanchenjunga range catching first light at sunrise",
  },
  {
    file: "four-occupancy.jpeg",
    alt: "A four-sharing room with two double beds under a wood-panelled ceiling, windows opening to the valley",
  },
  {
    file: "six-person-occupancy.jpeg",
    alt: "A spacious six-sharing room with three beds and wide windows framing the mountains",
  },
  {
    file: "Tent.jpeg",
    alt: "Tents pitched on the open ridge with the snow peaks of the range on the horizon",
  },
  {
    file: "Sunrise.jpg",
    alt: "The sun rising beside the homestay, camping tents and prayer flags on the ridge in the morning light",
  },
  {
    file: "NamthingPokhari.jpg",
    alt: "Namthing Pokhari lake ringed by pine forest in the monsoon rain, a tall Hanuman statue and saffron flags on its bank",
  },
  {
    file: "BirdinginLatpanchar.jpg",
    alt: "A yellow-and-green sunbird feeding on orange flowers in the forest",
  },
  {
    file: "SittongOraneOrchards.jpg",
    alt: "Ripe oranges hanging among dark green leaves on the tree",
  },
  {
    file: "teestariverfromtop.jpg",
    alt: "The emerald-green Teesta river winding through the forested valley far below",
  },
  {
    file: "morningontheridge.jpg",
    alt: "Visitors on the grassy ridgeline above a sea of clouds at dawn",
  },
  {
    file: "Thehighrangecleardayview.jpg",
    alt: "The snow-capped high range across the hills, seen from a tent doorway on a clear day",
  },
  {
    file: "teafromthehills.jpg",
    alt: "A glass cup of amber tea held up against a misty, tea-covered hillside",
  },
  {
    file: "firstlightoverthehills.jpg",
    alt: "Tents on a tea-covered ridge at dawn, distant snow peaks catching first light over rolling hills",
  },
  {
    // Not in site.ts — this image is hardcoded in src/components/About.tsx,
    // so its alt is copied verbatim from About.tsx:26, not from an imageAlt
    // field here.
    file: "the-homestay.jpg",
    alt: "The homestay's red-roofed cottages on the tea-garden ridge, layered hills and a cloud-filled valley beyond",
  },
];

/**
 * Curated Unsplash stock still standing in for photos the client has not
 * supplied yet — the stargazing experience and two gallery captions. These are
 * downloaded once into Media so all images are served locally. Swap them for
 * real photographs when they arrive.
 */
const REMOTE_IMAGES: { key: string; url: string; filename: string; alt: string }[] = [
  {
    key: "stargazing",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1600&auto=format&fit=crop",
    filename: "stargazing.jpg",
    alt: "The Milky Way over a dark mountain silhouette",
  },
  {
    key: "pines",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1800&auto=format&fit=crop",
    filename: "light-through-the-pines.jpg",
    alt: "Morning light through pine forest",
  },
  {
    key: "spread",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1800&auto=format&fit=crop",
    filename: "home-cooked-spread.jpg",
    alt: "Curries and rice served in steel bowls, home-style",
  },
];

async function findOrCreate(
  payload: Payload,
  filename: string,
  alt: string,
  data: Buffer,
  mimetype: string
): Promise<number> {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    pagination: false,
  });

  const found = existing.docs[0];
  if (found) {
    payload.logger.info(`media: reusing ${filename}`);
    return found.id as number;
  }

  const created = await payload.create({
    collection: "media",
    data: { alt },
    file: { name: filename, data, mimetype, size: data.byteLength },
    context: { disableRevalidate: true },
  });

  payload.logger.info(`media: uploaded ${filename}`);
  return created.id as number;
}

function mimeFor(filename: string): string {
  return filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
}

/**
 * Idempotent: existing media is reused by filename, never duplicated, and
 * never overwritten — so re-running the seed cannot clobber a client upload.
 */
export async function seedMedia(payload: Payload): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  const imagesDir = path.resolve(process.cwd(), "public/images");

  for (const { file, alt } of LOCAL_IMAGES) {
    const data = await fs.readFile(path.join(imagesDir, file));
    ids[file] = await findOrCreate(payload, file, alt, data, mimeFor(file));
  }

  for (const { key, url, filename, alt } of REMOTE_IMAGES) {
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: filename } },
      limit: 1,
      pagination: false,
    });

    if (existing.docs[0]) {
      ids[key] = existing.docs[0].id as number;
      payload.logger.info(`media: reusing ${filename}`);
      continue;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download stock photo ${filename} (${response.status} ${response.statusText}). ` +
          `Check the URL in src/seed/media.ts or supply a real photograph instead.`
      );
    }
    const data = Buffer.from(await response.arrayBuffer());
    ids[key] = await findOrCreate(payload, filename, alt, data, "image/jpeg");
  }

  return ids;
}
