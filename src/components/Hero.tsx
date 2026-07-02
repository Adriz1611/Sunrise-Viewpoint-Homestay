import Image from "next/image";
import { META } from "@/lib/site";

/** A word wrapped in an overflow mask that rises into view on load. */
function RisingWord({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="mask-line">
      <span
        className={`animate-rise inline-block ${className}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="grain relative flex min-h-svh flex-col justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <Image
        src="/images/hero-kanchenjunga.jpg"
        alt="The Kanchenjunga range catching first light at sunrise"
        fill
        priority
        sizes="100vw"
        className="animate-settle object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-40 sm:px-8 sm:pb-20">
        <p
          className="font-numeric animate-rise mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.7rem] uppercase tracking-[0.2em] text-dawn/90 sm:text-xs"
          style={{ animationDelay: "650ms" }}
        >
          <span>{META.coordinates}</span>
          <span aria-hidden className="hidden h-px w-8 bg-dawn/40 sm:block" />
          <span>Alt. {META.altitude}</span>
          <span aria-hidden className="hidden h-px w-8 bg-dawn/40 sm:block" />
          <span>{META.region}</span>
        </p>

        <h1 className="font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.92] tracking-tight text-cream">
          <RisingWord delay={100}>Sunrise</RisingWord>
          <br />
          <RisingWord delay={250}>
            Viewpoint<span className="text-ember">.</span>
          </RisingWord>
        </h1>

        <div className="mt-8 flex flex-col justify-between gap-8 sm:mt-12 sm:flex-row sm:items-end">
          <p
            className="animate-rise max-w-md text-base leading-relaxed text-cream-dim sm:text-lg"
            style={{ animationDelay: "500ms" }}
          >
            A family-run homestay on the Aahaldara ridge, where the day begins
            with Kanchenjunga on fire and the Teesta valley waking up in cloud
            far below.
          </p>
          <span className="mask-line shrink-0">
            <a
              href="#tariff"
              className="animate-rise inline-block rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-amber"
              style={{ animationDelay: "620ms" }}
            >
              Book your dawn
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
