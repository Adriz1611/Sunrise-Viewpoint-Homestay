import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { ArrowUpRight } from "@/components/icons";
import {
  MAP_DIRECTIONS_URL,
  MAP_EMBED_SRC,
  ROUTES,
  TRANSPORT_CONTACT,
} from "@/lib/site";

export default function GettingHere() {
  return (
    <section
      id="getting-here"
      className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="07"
          label="Getting Here"
          title="Under three hours from NJP station and Bagdogra airport."
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ul className="divide-y keyline border-y keyline">
              {ROUTES.map((route, i) => (
                <Reveal as="li" key={route.from} delay={i * 80}>
                  <div className="py-6">
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="font-display text-xl text-cream">
                        {route.from}
                      </h3>
                      <p className="font-numeric shrink-0 text-right text-sm text-celadon">
                        {route.distance}
                        <span className="block text-xs text-cream-dim">
                          {route.time}
                        </span>
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm text-cream-dim">{route.via}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={300} className="mt-8 space-y-6">
              <p className="text-sm leading-relaxed text-cream-dim">
                The last stretch climbs narrow hill roads through Kurseong and
                Latpanchar. The road is scenic but narrow, so plan to arrive
                before dark. We arrange pick-up and drop-off from Bagdogra
                Airport, NJP Station, Siliguri, or any location by road, plus
                local sightseeing and vehicle hire for your whole stay.
              </p>

              <div className="rounded-xl border keyline bg-ink-soft px-5 py-5 sm:px-6">
                <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">
                  Transport bookings
                </p>
                <p className="font-display mt-2 text-lg text-cream">
                  {TRANSPORT_CONTACT.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t keyline pt-4">
                  {TRANSPORT_CONTACT.phones.map((phone) => (
                    <a
                      key={phone.number}
                      href={phone.href}
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
  );
}
