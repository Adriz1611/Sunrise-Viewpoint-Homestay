import Image from "next/image";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { ACCOMMODATIONS } from "@/lib/site";

export default function Rooms() {
  return (
    <section id="rooms" className="scroll-mt-24 bg-ink-soft px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="02"
          label="Rooms"
          title={
            <>
              Eight rooms and camping tents. Every one of them{" "}
              <em className="text-amber">faces the light</em>.
            </>
          }
        />

        <div className="space-y-16 sm:space-y-24">
          {ACCOMMODATIONS.map((room, i) => (
            <Reveal
              key={room.name}
              as="article"
              className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-14 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[16/11] overflow-hidden rounded-2xl lg:col-span-7">
                <Image
                  src={room.image}
                  alt={room.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="lg:col-span-5">
                <p className="font-numeric mb-3 text-xs text-ember">
                  R–{String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
                  {room.name}
                </h3>
                <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-cream-dim">
                  {room.count}
                </p>
                <p className="mt-4 text-base leading-relaxed text-cream-dim sm:text-lg">
                  {room.tagline}
                </p>
                <ul className="mt-6 space-y-2.5 border-t keyline pt-6">
                  {room.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-cream-dim"
                    >
                      <span aria-hidden className="h-1 w-1 rounded-full bg-ember" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="font-numeric mt-6 text-xs uppercase tracking-[0.2em] text-cream-dim">
                  Occupancy: {room.occupancy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
