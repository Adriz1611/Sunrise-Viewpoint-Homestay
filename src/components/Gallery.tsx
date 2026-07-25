"use client";

import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import { galleryCell } from "@/lib/gallery-layout";
import { renderEmphasis } from "@/lib/emphasis";
import { mediaProps } from "@/lib/media";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Gallery as GalleryData } from "@/payload-types";

type GalleryProps = { data: GalleryData };

/**
 * Editorial mosaic: aligned rows with deliberately unequal column widths
 * (7/5, then 4/4/4, then one full-bleed panorama), captions always visible
 * bottom-left like gallery wall labels. Each photo keeps its own parallax
 * rate so neighbouring frames drift out of step.
 *
 * The shapes come from galleryCell(), which always gives the LAST photo the
 * full-bleed slot however many photos the client adds.
 */
export default function Gallery({ data: initialData }: GalleryProps) {
  const data = useSectionPreview("gallery", initialData);
  const photos = data.photos ?? [];

  return (
    <section id="gallery" className="scroll-mt-24 bg-ink-soft px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="04"
          label="Gallery"
          title={renderEmphasis(data.title)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:gap-4">
          {photos.map((photo, i) => {
            const cell = galleryCell(i, photos.length);
            const image = mediaProps(photo.image, `gallery.photos[${i}].image`);
            return (
              <figure
                key={photo.id ?? image.src}
                className={`group relative col-span-1 overflow-hidden rounded-xl ${cell.span} ${cell.height}`}
              >
                <div className="h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                  <ParallaxImage
                    src={image.src}
                    alt={image.alt}
                    sizes="(min-width: 640px) 60vw, 100vw"
                    speed={cell.speed}
                    className="h-full rounded-xl"
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12 sm:p-5">
                  <span className="font-display text-lg tracking-tight text-cream sm:text-xl">
                    {photo.caption}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
