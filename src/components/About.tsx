import Image from "next/image";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { META } from "@/lib/site";

const STATS = [
  { value: "5,000", unit: "ft above the plains" },
  { value: "180°", unit: "of unbroken dawn" },
  { value: "3", unit: "rooms, one family table" },
];

export default function About() {
  return (
    <section id="homestay" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="01"
          label="The Homestay"
          title={
            <>
              Built on the ridge our family has farmed for{" "}
              <em className="text-amber">three generations</em>.
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[560px]">
            <Image
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1800&auto=format&fit=crop"
              alt="First light breaking over the valley below the homestay"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </Reveal>

          <div className="flex flex-col justify-between gap-12">
            <div className="space-y-6 text-lg leading-relaxed text-cream-dim">
              <Reveal as="p">
                Aahaldara is the kind of place people used to drive past on the
                way to Darjeeling — until they saw what the sky does here at
                5 a.m. Our homestay sits right on the viewpoint ridge, so the
                sunrise isn&apos;t an excursion. It&apos;s the view from your
                pillow.
              </Reveal>
              <Reveal as="p" delay={100}>
                We keep it small on purpose: three rooms, food from our own
                kitchen and garden, and evenings that end around a fire rather
                than a television. You&apos;ll leave knowing our names, and
                we&apos;ll remember yours.
              </Reveal>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t keyline pt-8">
              {STATS.map((stat, i) => (
                <Reveal key={stat.unit} delay={i * 100}>
                  <dt className="sr-only">{stat.unit}</dt>
                  <dd>
                    <span className="font-numeric block text-3xl text-amber sm:text-4xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-cream-dim sm:text-sm">
                      {stat.unit}
                    </span>
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal className="font-numeric text-xs uppercase tracking-[0.25em] text-cream-dim">
              {META.coordinates} — {META.region}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
