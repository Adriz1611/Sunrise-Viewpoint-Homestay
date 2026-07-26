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
 * (7/5, then 4/4/4, then one full-bleed panorama), with captions in a stable
 * label band below each image. Each photo keeps its own parallax
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
                className={`group grid min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-xl bg-ink ${cell.span} ${cell.height}`}
              >
                <div className="min-h-0 overflow-hidden transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                  <ParallaxImage
                    src={image.src}
                    alt={image.alt}
                    sizes="(min-width: 640px) 60vw, 100vw"
                    speed={cell.speed}
                    className="h-full"
                  />
                </div>
                <figcaption className="border-t keyline bg-ink px-4 py-3 sm:px-5 sm:py-4">
                  <span className="block font-display text-base leading-snug tracking-tight text-cream sm:text-lg">
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
