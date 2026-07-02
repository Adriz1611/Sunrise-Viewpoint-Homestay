import Image from "next/image";
import { META } from "@/lib/site";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      {/* Backdrop */}
      <Image
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2400&auto=format&fit=crop"
        alt="Dawn fog rolling over the forested ridges below Aahaldara"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-40 sm:px-8 sm:pb-20">
        <p className="font-numeric mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.7rem] uppercase tracking-[0.2em] text-dawn/90 sm:text-xs">
          <span>{META.coordinates}</span>
          <span aria-hidden className="hidden h-px w-8 bg-dawn/40 sm:block" />
          <span>Alt. {META.altitude}</span>
          <span aria-hidden className="hidden h-px w-8 bg-dawn/40 sm:block" />
          <span>{META.region}</span>
        </p>

        <h1 className="font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.92] tracking-tight text-cream">
          Sunrise
          <br />
          Viewpoint
          <span className="text-ember">.</span>
        </h1>

        <div className="mt-8 flex flex-col justify-between gap-8 sm:mt-12 sm:flex-row sm:items-end">
          <p className="max-w-md text-base leading-relaxed text-cream-dim sm:text-lg">
            A family-run homestay on the Aahaldara ridge, where the day begins
            with Kanchenjunga on fire and a river of cloud in the Teesta valley
            below.
          </p>
          <a
            href="#tariff"
            className="group inline-flex w-fit items-center gap-3 rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-amber"
          >
            Book your dawn
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
