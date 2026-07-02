import Reveal from "@/components/Reveal";
import { CONTACT, META } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden px-5 pb-10 pt-24 sm:px-8 sm:pt-32">
      {/* Oversized backdrop word */}
      <p
        aria-hidden
        className="text-outline pointer-events-none absolute -bottom-6 left-1/2 w-max -translate-x-1/2 select-none font-display text-[22vw] leading-none tracking-tight"
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
              Call or WhatsApp
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
              Write
            </h3>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-4 block text-lg text-cream transition-colors hover:text-amber"
            >
              {CONTACT.email}
            </a>
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
