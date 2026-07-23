"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { META } from "@/lib/site";

/**
 * Cinematic opening: the headline rises character by character out of line
 * masks while the backdrop holds still. The intro plays
 * on mount. On scroll the backdrop parallaxes at a slower rate than the
 * page and the foreground content drifts up and fades — the classic
 * "camera pulling away" beat.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;

      // Hold the headline hidden until the web fonts are ready. Splitting
      // before Fraunces has loaded lets autoSplit re-split on the font swap
      // mid-animation — the stutter that briefly clipped the "p" in
      // "Viewpoint". Hiding first also avoids a flash of the fallback font.
      gsap.set([".hero-title", ".hero-fade"], { autoAlpha: 0 });

      // — Intro timeline (plays once fonts are ready, on final metrics) —
      const runIntro = contextSafe!(() => {
        SplitText.create(".hero-title", {
          type: "chars,lines",
          mask: "lines",
          autoSplit: true,
          // Names the per-line mask elements .hero-line-mask-mask (GSAP's
          // "-mask" suffix convention) so CSS can extend just the bottom of
          // their overflow-clip box — freeing Fraunces' descenders without
          // touching line-height, so the gap between "Sunrise" and "Viewpoint"
          // stays at the h1's real leading-[0.92] throughout. See globals.css.
          linesClass: "hero-line-mask",
          onSplit(self) {
            return gsap.from(self.chars, {
              yPercent: 120,
              duration: 1.5,
              stagger: 0.035,
              ease: "power4.out",
              delay: 0.3,
              onComplete: () => self.revert(),
            });
          },
        });
        // Reveal the container now that the chars sit hidden below their masks.
        gsap.set(".hero-title", { autoAlpha: 1 });

        gsap.fromTo(
          ".hero-fade",
          { y: 36, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.14,
            delay: 1,
          }
        );
      });
      document.fonts.ready.then(runIntro);

      // — Scroll-scrubbed parallax —
      // The oversized wrapper (-inset-y-[12%]) gives the drift room to move
      // without ever exposing the image's edges.
      gsap.to(".hero-img-wrap", {
        yPercent: 9,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-content", {
        yPercent: -16,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "80% top",
          scrub: true,
        },
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      className="grain relative flex min-h-svh flex-col justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div className="hero-img-wrap absolute inset-x-0 -inset-y-[12%]">
        <Image
          src="/images/hero-kanchenjunga.jpg"
          alt="The Kanchenjunga range catching first light at sunrise"
          fill
          priority
          sizes="100vw"
          className="hero-img object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink" />

      <div className="hero-content relative mx-auto w-full max-w-7xl px-5 pb-14 pt-40 sm:px-8 sm:pb-20">
        <p className="hero-fade font-numeric mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.7rem] uppercase tracking-[0.2em] text-dawn/90 sm:text-xs">
          <span>{META.coordinates}</span>
          <span aria-hidden className="hidden h-px w-8 bg-dawn/40 sm:block" />
          <span>Alt. {META.altitude}</span>
          <span aria-hidden className="hidden h-px w-8 bg-dawn/40 sm:block" />
          <span>{META.region}</span>
        </p>

        <h1 className="hero-title font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.92] tracking-tight text-cream">
          Sunrise
          <br />
          Viewpoint<span className="text-teal">.</span>
        </h1>

        <div className="mt-8 flex flex-col justify-between gap-8 sm:mt-12 sm:flex-row sm:items-end">
          <p className="hero-fade max-w-md text-base leading-relaxed text-cream-dim sm:text-lg">
            A family-run homestay on the Aahaldara ridge, with a 180° sunrise
            view of the Kanchenjunga range and the Teesta valley far below.
          </p>
          <a
            href="#tariff"
            className="hero-fade inline-block shrink-0 self-start rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-ink transition-[transform,color,background-color] duration-200 hover:bg-celadon active:scale-[0.97] sm:self-auto"
          >
            Call to book
          </a>
        </div>
      </div>
    </section>
  );
}
