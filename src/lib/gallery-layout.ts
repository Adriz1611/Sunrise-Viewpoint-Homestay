export type GalleryCell = { span: string; height: string; speed: number };

/**
 * The gallery mosaic used to be a fixed six-slot array indexed with
 * `i % LAYOUT.length`. Now that the client can add photos, that would wrap a
 * seventh photo into the first slot and silently lose the full-bleed panorama
 * the last slot exists for. So the last photo always gets the panorama and
 * everything before it cycles the remaining five shapes.
 */
const PANORAMA: GalleryCell = {
  span: "sm:col-span-12",
  height: "h-[38vh] sm:h-[62vh]",
  speed: 9,
};

const CYCLE: GalleryCell[] = [
  { span: "sm:col-span-7", height: "h-[38vh] sm:h-[56vh]", speed: 6 },
  { span: "sm:col-span-5", height: "h-[38vh] sm:h-[56vh]", speed: 10 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 8 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 12 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 7 },
];

export function galleryCell(index: number, total: number): GalleryCell {
  if (index === total - 1) return PANORAMA;
  return CYCLE[index % CYCLE.length];
}
