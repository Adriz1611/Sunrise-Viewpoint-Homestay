"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import SectionHeading from "@/components/SectionHeading";
import { renderEmphasis } from "@/lib/emphasis";
import { mediaProps } from "@/lib/media";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Room } from "@/payload-types";

type RoomsProps = { data: Room };

/**
 * On desktop the section pins and the room panels travel horizontally,
 * scrubbed to scroll — one full-bleed cinematic panel per accommodation.
 * Below lg (and for reduced motion) it falls back to a vertical stack of
 * the same panels with no pinning.
 */
export default function Rooms({ data: initialData }: RoomsProps) {
  const data = useSectionPreview("rooms", initialData);
  const items = data.items ?? [];
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const t = track.current;
        if (!t) return;
        const distance = () => t.scrollWidth - window.innerWidth;

        gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="rooms"
      className="scroll-mt-24 overflow-hidden bg-ink-soft py-24 sm:py-32 lg:flex lg:h-svh lg:flex-col lg:py-0"
    >
      <div className="px-5 sm:px-8 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            index="02"
            label="Rooms"
            title={renderEmphasis(data.title)}
          />
        </div>
      </div>

      <div
        ref={track}
        className="flex flex-col gap-8 px-5 sm:px-8 lg:min-h-0 lg:flex-1 lg:flex-row lg:flex-nowrap lg:items-stretch lg:pb-20 lg:pr-[14vw]"
      >
        {items.map((room, i) => {
          const photo = mediaProps(room.image, `rooms.items[${i}].image`);
          return (
            <article
              key={room.id ?? room.name}
              className="relative overflow-hidden rounded-3xl border keyline bg-ink lg:h-full lg:w-[70vw] lg:shrink-0"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="hidden sm:block absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/10"
                />
              </div>

              {/* Stacked below the photo on phones; overlaid on the photo from sm up */}
              <div className="p-6 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-9 lg:p-12">
                <div className="flex items-baseline justify-between">
                  <p className="font-numeric text-xs text-teal">
                    ({String(i + 1).padStart(2, "0")})
                  </p>
                  <p className="font-numeric text-xs uppercase tracking-[0.2em] text-cream-dim">
                    {room.count}
                  </p>
                </div>
                <h3 className="font-display mt-3 text-3xl tracking-tight text-cream sm:text-5xl">
                  {room.name}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream-dim sm:text-base">
                  {room.tagline}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {(room.features ?? []).map((feature) => (
                    <li
                      key={feature.id ?? feature.value}
                      className="rounded-full border border-cream/20 bg-ink/70 px-3.5 py-1.5 text-xs text-cream transition-colors duration-300 hover:border-cream/25"
                    >
                      {feature.value}
                    </li>
                  ))}
                </ul>
                <p className="font-numeric mt-6 text-[0.65rem] uppercase tracking-[0.2em] text-cream-dim">
                  Occupancy: {room.occupancy}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
