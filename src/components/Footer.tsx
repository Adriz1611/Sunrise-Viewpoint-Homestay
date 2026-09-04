"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import FooterWeather from "@/components/FooterWeather";
import Reveal from "@/components/Reveal";
import { Star } from "@/components/icons";
import { GOOGLE_REVIEWS } from "@/lib/site";
import { telHref } from "@/lib/phone";
import type { SiteSetting } from "@/payload-types";

type FooterProps = {
  settings: SiteSetting;
};

export default function Footer({ settings }: FooterProps) {
  const root = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Flyward-style entrance: the footer "opens" inside its border frame
      // as it scrolls into view — the clip wipes down to nothing while the
      // content drifts up to meet it.
      gsap.fromTo(
        ".footer-frame",
        { clipPath: "inset(42% 5% 0% 5% round 2rem)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 2rem)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "top 25%",
            scrub: true,
          },
        }
      );
      gsap.fromTo(
        ".footer-inner",
        { y: 90 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "top 25%",
            scrub: true,
          },
        }
      );

      // The backdrop word rises out of the footer's clipped bottom edge as
      // the footer scrolls into view. It ENDS at its static CSS position —
      // the one verified not to overlap the content above — so the scrub
      // can't reintroduce the overlap bug.
      gsap.fromTo(
        ".footer-word",
        { yPercent: 60 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    },
    { scope: root }
  );

  return (
    <div ref={root} className="px-2 pb-2 sm:px-3 sm:pb-3">
      <footer className="footer-frame relative overflow-hidden rounded-[2rem] border keyline bg-ink-soft px-5 pb-28 pt-24 sm:px-8 sm:pb-64 sm:pt-32 lg:pb-72">
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
        className="footer-word text-outline pointer-events-none absolute bottom-0 left-1/2 w-max -translate-x-1/2 select-none font-display text-[clamp(2.5rem,14vw,4.5rem)] leading-none tracking-tight sm:-bottom-4 sm:text-[clamp(6rem,20vw,15rem)]"
      >
        Aahaldara
      </p>

      <div className="footer-inner relative mx-auto max-w-7xl">
        <Reveal>
          <p className="font-numeric text-xs uppercase tracking-[0.2em] text-teal">
            Plan your visit
          </p>
        </Reveal>
        <FooterWeather />

        <div className="mt-14 grid gap-10 border-t keyline pt-10 sm:mt-20 md:grid-cols-3">
          <Reveal>
            <h3 className="text-xs uppercase tracking-[0.2em] text-cream-dim">
              Bookings
            </h3>
            <div className="mt-4 space-y-3">
              {settings.bookingPhones.map((phone) => (
                <a
                  key={phone.number}
                  href={telHref(phone.number)}
                  className="font-numeric block whitespace-nowrap text-2xl text-cream transition-colors hover:text-celadon lg:text-3xl"
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
            <p className="mt-4 text-sm text-cream-dim">{settings.transportName}</p>
            <div className="mt-2 space-y-1.5">
              {settings.transportPhones.map((phone) => (
                <a
                  key={phone.number}
                  href={telHref(phone.number)}
                  className="font-numeric block text-lg text-cream transition-colors hover:text-celadon"
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
              {settings.address}
            </p>
            <p className="font-numeric mt-3 text-xs tracking-[0.15em] text-cream-dim">
              {settings.coordinates}
            </p>
            <a
              href={GOOGLE_REVIEWS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border keyline px-4 py-2 text-xs text-cream transition-colors hover:border-teal hover:text-celadon"
            >
              <span className="font-numeric inline-flex items-center gap-1 text-celadon">
                {GOOGLE_REVIEWS.rating}
                <Star className="h-3 w-3" />
              </span>
              on Google · {GOOGLE_REVIEWS.count} reviews
            </a>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t keyline pt-6 text-xs text-cream-dim sm:flex-row sm:items-center">
          <p>© {year} Sunrise Viewpoint Homestay, Aahaldara. All rights reserved.</p>
          <p className="font-numeric">
            Alt. {settings.altitude}
          </p>
        </div>
      </div>
      </footer>
    </div>
  );
}
