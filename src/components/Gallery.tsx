import ParallaxImage from "@/components/ParallaxImage";
import SectionHeading from "@/components/SectionHeading";
import { GALLERY } from "@/lib/site";

/**
 * Editorial mosaic: aligned rows with deliberately unequal column widths
 * (7/5, then 4/4/4, then one full-bleed panorama), captions always visible
 * bottom-left like gallery wall labels. Each photo keeps its own parallax
 * rate so neighbouring frames drift out of step.
 */
const LAYOUT = [
  { span: "sm:col-span-7", height: "h-[38vh] sm:h-[56vh]", speed: 6 },
  { span: "sm:col-span-5", height: "h-[38vh] sm:h-[56vh]", speed: 10 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 8 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 12 },
  { span: "sm:col-span-4", height: "h-[34vh] sm:h-[42vh]", speed: 7 },
  { span: "sm:col-span-12", height: "h-[38vh] sm:h-[62vh]", speed: 9 },
];

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
              <em className="text-celadon">nobody is posing</em>.
            </>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:gap-4">
          {GALLERY.map((photo, i) => {
            const cell = LAYOUT[i % LAYOUT.length];
            return (
              <figure
                key={photo.src}
                className={`relative col-span-1 ${cell.span} ${cell.height}`}
              >
                <ParallaxImage
                  src={photo.src}
                  alt={photo.alt}
                  sizes="(min-width: 640px) 60vw, 100vw"
                  speed={cell.speed}
                  className="h-full rounded-xl"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12 sm:p-5">
                  <span className="font-display text-lg tracking-tight text-cream sm:text-xl">
                    {photo.alt}
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
