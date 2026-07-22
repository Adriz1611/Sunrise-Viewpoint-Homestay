import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import {
  ACCOMMODATIONS,
  CONTACT,
  MEALS_EXTRA,
  MEALS_INCLUDED,
  STAY_INFO,
  TARIFF,
  TARIFF_NOTES,
} from "@/lib/site";

// Quick-glance highlights for the chip row below — derived only from facts
// already present in site.ts (MEALS_INCLUDED, ACCOMMODATIONS features).
const HOT_WATER = ACCOMMODATIONS.some((room) =>
  room.features.some((f) => /hot water/i.test(f))
);
const TARIFF_HIGHLIGHTS = [
  `All ${MEALS_INCLUDED.length} meals included`,
  ...(HOT_WATER ? ["Hot water in every room"] : []),
];

export default function Tariff() {
  return (
    <section id="tariff" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="05"
          label="Tariff & Booking"
          title={
            <>
              One per-person price, <em className="text-celadon">meals included</em>.
            </>
          }
        />

        {/* Quick-glance highlights */}
        <Reveal className="mb-8 flex flex-wrap gap-2">
          {TARIFF_HIGHLIGHTS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-cream/20 bg-ink/70 px-3.5 py-1.5 text-xs text-cream transition-colors duration-300 hover:border-cream/25"
            >
              {item}
            </span>
          ))}
        </Reveal>

        {/* Price board — full-width rows, menu style */}
        <ul className="divide-y keyline border-y keyline">
          {TARIFF.map((item, i) => (
            <Reveal as="li" key={item.name} delay={i * 70}>
              <div className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 border border-transparent py-7 transition-colors duration-300 hover:border-cream/25 hover:bg-ink-soft sm:px-4">
                <span className="font-numeric text-xs text-teal">
                  ({String(i + 1).padStart(2, "0")})
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-2xl text-cream transition-colors duration-300 group-hover:text-celadon sm:text-3xl">
                    {item.name}
                  </h3>
                  {item.note && (
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-cream-dim">
                      {item.note}
                    </p>
                  )}
                </div>
                <p className="flex items-baseline gap-2 text-right">
                  <span className="font-numeric text-3xl text-celadon sm:text-5xl">
                    {item.price}
                  </span>
                  <span className="text-xs text-cream-dim">{item.unit}</span>
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* What the tariff covers */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">
              Included in every stay
            </p>
            <ul className="mt-3 space-y-2">
              {MEALS_INCLUDED.map((meal) => (
                <li key={meal} className="flex items-center gap-3 text-sm text-cream-dim">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-teal" />
                  {meal}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">
              Available on request, extra cost
            </p>
            <ul className="mt-3 space-y-2">
              {MEALS_EXTRA.map((meal) => (
                <li key={meal} className="flex items-center gap-3 text-sm text-cream-dim">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-cream-dim" />
                  {meal}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="ul" delay={160} className="space-y-2.5 sm:col-span-2 lg:col-span-1">
            {TARIFF_NOTES.map((note) => (
              <li key={note} className="flex gap-3 text-sm leading-relaxed text-cream-dim">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal" />
                {note}
              </li>
            ))}
          </Reveal>
        </div>

        {/* Reserve band — wide, action-first */}
        <Reveal delay={120} className="mt-14">
          <div className="overflow-hidden rounded-3xl border keyline bg-ink-soft">
            <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="font-numeric text-xs uppercase tracking-[0.2em] text-teal">
                  Reserve
                </p>
                <h3 className="font-display mt-4 text-3xl leading-tight text-cream sm:text-4xl">
                  One phone call is all it takes.
                </h3>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="font-numeric rounded-full border keyline px-4 py-2 text-xs text-cream-dim">
                    Check-in {STAY_INFO.checkIn}
                  </span>
                  <span className="font-numeric rounded-full border keyline px-4 py-2 text-xs text-cream-dim">
                    Check-out {STAY_INFO.checkOut}
                  </span>
                  <span className="font-numeric rounded-full border keyline px-4 py-2 text-xs text-cream-dim">
                    First light 05:30 IST
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                {CONTACT.phones.map((phone, i) => (
                  <a
                    key={phone.number}
                    href={phone.href}
                    className={`font-numeric whitespace-nowrap rounded-full px-8 py-4 text-center text-xl transition-[transform,color,background-color,border-color] duration-200 active:scale-[0.97] sm:text-2xl ${
                      i === 0
                        ? "bg-cream text-ink hover:bg-celadon"
                        : "border keyline text-cream hover:border-teal hover:text-celadon"
                    }`}
                  >
                    {phone.number}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
