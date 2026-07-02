import Reveal from "@/components/Reveal";
import { CONTACT, GOOGLE_REVIEWS, META, TRANSPORT_CONTACT } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden px-5 pb-28 pt-24 sm:px-8 sm:pb-64 sm:pt-32 lg:pb-72">
      {/*
        Oversized backdrop word. Font size is fluid but CAPPED via clamp() at
        each breakpoint — critical, because "bottom" offset + fixed padding
        only stays overlap-free if the glyph height has a hard ceiling. An
        uncapped vw value keeps growing on wider screens with nothing to stop
        it colliding with the content above. Mobile stays small/restrained
        (matches the tighter padding above); sm+ gets the large dramatic
        treatment, capped at 15rem so it never outgrows the bigger padding
        reserved for it at those sizes.

        The negative bottom offset lets the word bleed slightly past the
        footer's own edge (clipped by overflow-hidden) for an editorial crop
        effect — a fixed pixel amount is imperceptible against a 240px-tall
        desktop glyph but crops off ~1/3 of a ~58px mobile glyph, reading as
        broken rather than stylish. So no bleed on mobile; only sm+.
      */}
      <p
        aria-hidden
        className="text-outline pointer-events-none absolute bottom-0 left-1/2 w-max -translate-x-1/2 select-none font-display text-[clamp(2.5rem,14vw,4.5rem)] leading-none tracking-tight sm:-bottom-4 sm:text-[clamp(6rem,20vw,15rem)]"
      >
        Aahaldara
      </p>

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <p className="font-numeric text-xs uppercase tracking-[0.25em] text-ember">
            Come see for yourself
          </p>
          <h2 className="font-display mt-5 max-w-4xl text-5xl leading-[1.02] tracking-tight text-cream sm:text-7xl">
            The sun rises at six.
            <br />
            <em className="text-amber">Be here at five-thirty.</em>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 border-t keyline pt-10 sm:mt-20 md:grid-cols-3">
          <Reveal>
            <h3 className="text-xs uppercase tracking-[0.2em] text-cream-dim">
              Bookings
            </h3>
            <div className="mt-4 space-y-3">
              {CONTACT.phones.map((phone) => (
                <a
                  key={phone.number}
                  href={phone.href}
                  className="font-numeric block whitespace-nowrap text-2xl text-cream transition-colors hover:text-amber lg:text-3xl"
                >
                  {phone.number}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h3 className="text-xs uppercase tracking-[0.2em] text-cream-dim">
              Transport & pickup
            </h3>
            <p className="mt-4 text-sm text-cream-dim">{TRANSPORT_CONTACT.name}</p>
            <div className="mt-2 space-y-1.5">
              {TRANSPORT_CONTACT.phones.map((phone) => (
                <a
                  key={phone.number}
                  href={phone.href}
                  className="font-numeric block text-lg text-cream transition-colors hover:text-amber"
                >
                  {phone.number}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <h3 className="text-xs uppercase tracking-[0.2em] text-cream-dim">
              Find us
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-cream-dim">
              {CONTACT.address}
            </p>
            <p className="font-numeric mt-3 text-xs tracking-[0.15em] text-cream-dim">
              {META.coordinates}
            </p>
            <a
              href={GOOGLE_REVIEWS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border keyline px-4 py-2 text-xs text-cream transition-colors hover:border-ember hover:text-amber"
            >
              <span className="font-numeric text-amber">
                {GOOGLE_REVIEWS.rating} ★
              </span>
              on Google · {GOOGLE_REVIEWS.count} reviews
            </a>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t keyline pt-6 text-xs text-cream-dim sm:flex-row sm:items-center">
          <p>© {year} Sunrise Viewpoint Homestay, Aahaldara. All rights reserved.</p>
          <p className="font-numeric">
            Alt. {META.altitude} — first light 05:30 IST
          </p>
        </div>
      </div>
    </footer>
  );
}
