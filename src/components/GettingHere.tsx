import Reveal from '@/components/Reveal'
import SectionHeading from '@/components/SectionHeading'
import { ArrowUpRight } from '@/components/icons'
import { ALTERNATIVE_ROUTES, MAP_DIRECTIONS_URL, MAP_EMBED_SRC, ROUTES } from '@/lib/site'
import { telHref } from '@/lib/phone'

type GettingHereProps = {
  transport: { name: string; phones: { number: string }[] }
}

export default function GettingHere({ transport }: GettingHereProps) {
  return (
    <section id="getting-here" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="07" label="Getting Here" title="How to Reach Us" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ul className="divide-y keyline border-y keyline">
              {ROUTES.map((route, i) => (
                <Reveal as="li" key={route.from} delay={i * 80}>
                  <div className="py-6">
                    <div>
                      <h3 className="font-display text-xl leading-snug text-cream">
                        From {route.from}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                      <span className="text-celadon">Route: </span>
                      {route.via}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={300} className="mt-8 space-y-6">
              <div>
                <h3 className="font-display text-xl text-cream">Alternative Routes</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                  You can also reach {ALTERNATIVE_ROUTES.destination} via:
                </p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-celadon">
                  {ALTERNATIVE_ROUTES.via.map((place) => (
                    <li key={place}>{place}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm leading-relaxed text-cream-dim">
                We arrange pick-up and drop-off from Bagdogra Airport, NJP Station, Siliguri, or any
                location by road, plus local sightseeing and vehicle hire for your whole stay.
              </p>

              <div className="rounded-xl border keyline bg-ink-soft px-5 py-5 sm:px-6">
                <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">
                  Transport bookings
                </p>
                <p className="font-display mt-2 text-lg text-cream">{transport.name}</p>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t keyline pt-4">
                  {transport.phones.map((phone) => (
                    <a
                      key={phone.number}
                      href={telHref(phone.number)}
                      className="font-numeric whitespace-nowrap text-base text-cream transition-colors hover:text-celadon"
                    >
                      {phone.number}
                    </a>
                  ))}
                </div>
              </div>

              <a
                href={MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border keyline px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-teal hover:text-celadon"
              >
                Open in Google Maps
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>

          <Reveal delay={150} className="lg:col-span-7">
            <div className="map-frame relative h-full min-h-[380px] overflow-hidden rounded-2xl border keyline sm:min-h-[480px]">
              <iframe
                src={MAP_EMBED_SRC}
                title="Map showing Sunrise Viewpoint Homestay, Aahaldara"
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
