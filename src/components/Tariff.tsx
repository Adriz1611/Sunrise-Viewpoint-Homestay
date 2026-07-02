import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { CONTACT, TARIFF, TARIFF_NOTES } from "@/lib/site";

export default function Tariff() {
  return (
    <section id="tariff" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="05"
          label="Tariff & Booking"
          title={
            <>
              Honest hill prices, <em className="text-amber">meals included</em>.
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ul className="divide-y keyline border-y keyline">
              {TARIFF.map((item, i) => (
                <Reveal as="li" key={item.name} delay={i * 80}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-6">
                    <div>
                      <h3 className="font-display text-xl text-cream sm:text-2xl">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-cream-dim">
                        {item.includes}
                      </p>
                    </div>
                    <p className="text-right">
                      <span className="font-numeric text-3xl text-amber sm:text-4xl">
                        {item.price}
                      </span>
                      <span className="block text-xs text-cream-dim">
                        {item.unit}
                      </span>
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal as="ul" delay={200} className="mt-8 space-y-2.5">
              {TARIFF_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 text-sm leading-relaxed text-cream-dim"
                >
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" />
                  {note}
                </li>
              ))}
            </Reveal>
          </div>

          <Reveal delay={150} className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between gap-10 rounded-2xl border keyline bg-ink-soft p-8 sm:p-10">
              <div>
                <p className="font-numeric text-xs uppercase tracking-[0.25em] text-ember">
                  Reserve
                </p>
                <h3 className="font-display mt-4 text-3xl leading-tight text-cream">
                  One call holds
                  <br />
                  your sunrise.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-cream-dim">
                  We answer between 7 a.m. and 9 p.m. — and yes, WhatsApp
                  photos of the morning view are free.
                </p>
              </div>

              <div className="space-y-4">
                {CONTACT.phones.map((phone) => (
                  <a
                    key={phone.number}
                    href={phone.href}
                    className="group block border-t keyline pt-4"
                  >
                    <span className="text-xs uppercase tracking-[0.2em] text-cream-dim">
                      {phone.label}
                    </span>
                    <span className="font-numeric mt-1 block whitespace-nowrap text-2xl text-cream transition-colors group-hover:text-amber sm:text-[1.65rem]">
                      {phone.number}
                    </span>
                  </a>
                ))}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group block border-t keyline pt-4"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-cream-dim">
                    Email
                  </span>
                  <span className="mt-1 block text-lg text-cream transition-colors group-hover:text-amber">
                    {CONTACT.email}
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
