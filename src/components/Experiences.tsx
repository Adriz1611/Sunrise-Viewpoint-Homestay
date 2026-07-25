"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import SectionHeading from "@/components/SectionHeading";
import { renderEmphasis } from "@/lib/emphasis";
import { mediaProps } from "@/lib/media";
import { useSectionPreview } from "@/lib/useSectionPreview";
import type { Experience } from "@/payload-types";

type ExperiencesProps = { data: Experience };

/**
 * Stacked-deck scroll: each card pins below the nav while the next one
 * slides up over it; the covered card recedes (scales down, staying fully
 * opaque so its text never ghosts through the incoming card mid-scrub) in
 * scrub with the incoming card's travel. Sticky positioning does the
 * pinning, GSAP does the recede — no pin-spacer juggling required.
 */
export default function Experiences({ data: initialData }: ExperiencesProps) {
  const data = useSectionPreview("experiences", initialData);
  const items = data.items ?? [];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const cards = gsap.utils.toArray<HTMLElement>(".exp-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.94,
          transformOrigin: "center top",
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top 80%",
            end: "top 16%",
            scrub: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="experiences"
      className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="03"
          label="Experiences"
          title={renderEmphasis(data.title)}
        />

        <div className="space-y-6 sm:space-y-8">
          {items.map((exp, i) => {
            const photo = mediaProps(exp.image, `experiences.items[${i}].image`);
            return (
              <article
                key={exp.id ?? exp.title}
                className="exp-card sticky top-[14vh] overflow-hidden rounded-3xl border keyline bg-ink-soft sm:top-[16vh]"
                style={{ zIndex: i + 1 }}
              >
                <div className="grid lg:grid-cols-2">
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[440px]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink-soft/60 to-transparent lg:bg-gradient-to-r"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:p-12">
                    <div className="flex items-baseline justify-end">
                      <p className="font-numeric text-xs text-cream-dim">
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(items.length).padStart(2, "0")}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-3xl leading-tight tracking-tight text-cream sm:text-4xl">
                        {exp.title}
                      </h3>
                      <p className="mt-5 max-w-md text-base leading-relaxed text-cream-dim sm:text-lg">
                        {exp.body}
                      </p>
                    </div>
                    <p className="font-numeric text-[0.65rem] uppercase tracking-[0.2em] text-cream-dim">
                      {data.cardFooterLabel}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
