import Counter from "@/components/Counter";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { META } from "@/lib/site";

const STATS = [
  { value: "8", unit: "rooms across the tea garden" },
  { value: "180°", unit: "of Kanchenjunga at dawn" },
  { value: "~10", unit: "years welcoming guests" },
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
              Built by the Chamling family, on a ridge they turned from{" "}
              <em className="text-celadon">barren to blooming</em>.
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1800&auto=format&fit=crop"
            alt="First light breaking over the valley below the homestay"
            sizes="(min-width: 1024px) 50vw, 100vw"
            speed={9}
            className="aspect-[4/5] rounded-2xl lg:aspect-auto lg:min-h-[560px]"
          />

          <div className="flex flex-col justify-between gap-12">
            <div className="space-y-6 text-lg leading-relaxed text-cream-dim">
              <Reveal as="p">
                Locally known as Chamling Homestay, Sunrise Viewpoint sits on a
                ridge in Aahal Dara, Sittong III — land that was once barren,
                nurtured over years into the tea garden you&apos;ll wake up in
                today. It&apos;s the kind of place people used to drive past on
                the way to Darjeeling, until they saw what the sky does here
                at dawn.
              </Reveal>
              <Reveal as="p" delay={100}>
                Harkaram and Saru Chamling run it with their three daughters —
                Rakhee, Neeta and S. Chamling — on a simple philosophy: treat
                every guest like family. Nearly a decade in, every meal is
                still cooked fresh, every smile still genuine.
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

            <Reveal className="font-numeric text-xs uppercase tracking-[0.25em] text-cream-dim">
              {META.coordinates} — {META.region}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
