import Counter from "@/components/Counter";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import type { SiteSetting } from "@/payload-types";

type AboutProps = {
  meta: Pick<SiteSetting, "coordinates" | "region">;
};

const STATS = [
  { value: "8", unit: "rooms across the tea garden" },
  { value: "180°", unit: "of Kanchenjunga at dawn" },
  { value: "~10", unit: "years welcoming guests" },
];

export default function About({ meta }: AboutProps) {
  return (
    <section id="homestay" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="01"
          label="The Homestay"
          title="Built by the Chamling family, on a ridge they planted into a working tea garden."
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <ParallaxImage
            src="/images/the-homestay.jpg"
            alt="The homestay's red-roofed cottages on the tea-garden ridge, layered hills and a cloud-filled valley beyond"
            sizes="(min-width: 1024px) 50vw, 100vw"
            speed={9}
            className="aspect-[4/5] rounded-2xl lg:aspect-auto lg:min-h-[560px]"
          />

          <div className="flex flex-col justify-between gap-12">
            <div className="space-y-6 text-lg leading-relaxed text-cream-dim">
              <Reveal as="p">
                The family turned land that was once barren into the tea
                garden that surrounds the rooms today. The ridge looks
                straight at the Kanchenjunga range, with the Teesta valley
                below.
              </Reveal>
              <Reveal as="p" delay={100}>
                Meals are cooked at home by the family and included in the
                tariff. Rooms are simple, the water is hot, and the veranda
                faces the range.
              </Reveal>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t keyline pt-8">
              {STATS.map((stat, i) => (
                <Reveal key={stat.unit} delay={i * 100}>
                  <dt className="sr-only">{stat.unit}</dt>
                  <dd>
                    <Counter
                      value={stat.value}
                      className="font-numeric block text-3xl text-celadon sm:text-4xl"
                    />
                    <span className="mt-1 block text-xs leading-snug text-cream-dim sm:text-sm">
                      {stat.unit}
                    </span>
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal className="font-numeric text-xs uppercase tracking-[0.2em] text-cream-dim">
              {meta.coordinates} — {meta.region}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
