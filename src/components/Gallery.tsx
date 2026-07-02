import Image from "next/image";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { GALLERY } from "@/lib/site";

export default function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-24 bg-ink-soft px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="04"
          label="Gallery"
          title={
            <>
              What the ridge looks like when{" "}
              <em className="text-amber">nobody is posing</em>.
            </>
          }
        />

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {GALLERY.map((photo, i) => (
            <Reveal key={photo.src} delay={(i % 3) * 80}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-10 text-xs text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.alt}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
