"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { ArrowUpRight, Star } from "@/components/icons";
import { GOOGLE_REVIEWS, TESTIMONIALS } from "@/lib/site";

function Stars({ rating }: { rating: number }) {
  return (
    <p
      className="flex items-center gap-0.5 text-celadon"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {Array.from({ length: rating }, (_, i) => (
          <Star key={i} className="h-3 w-3" />
        ))}
        <span className="text-ink-line flex items-center gap-0.5">
          {Array.from({ length: 5 - rating }, (_, i) => (
            <Star key={i} className="h-3 w-3" />
          ))}
        </span>
      </span>
    </p>
  );
}

function ReviewCard({
  review,
}: {
  review: (typeof TESTIMONIALS)[number];
}) {
  return (
    <figure className="flex w-[19rem] shrink-0 flex-col justify-between gap-5 rounded-2xl border keyline bg-ink p-6 transition-colors duration-300 hover:border-cream/25 sm:w-[22rem] sm:p-7">
      <div className="space-y-4">
        <Stars rating={review.rating} />
        <blockquote className="text-sm leading-relaxed text-cream-dim sm:text-[0.925rem]">
          &ldquo;{review.text}&rdquo;
        </blockquote>
      </div>
      <figcaption className="border-t keyline pt-4">
        <p className="font-display text-base text-cream">{review.name}</p>
        <p className="mt-0.5 text-xs text-cream-dim">{review.meta}</p>
      </figcaption>
    </figure>
  );
}

/**
 * Renders `reviews` as one "unit", then two units back to back. The marquee
 * animates by exactly -50% (one unit-width), so it loops seamlessly — but
 * only if a single unit is wider than the viewport, or the tail end of the
 * loop shows blank space before the copy wraps back in. With 16 real reviews
 * at ~360-400px per card, one unit is already ~6000px — comfortably wider
 * than any real monitor (verified at 2560px) — without rendering excess
 * duplicate DOM. The animated strip is aria-hidden; a static sr-only list
 * elsewhere on the page gives assistive tech each review exactly once.
 */
function MarqueeRow({
  reviews,
  reverse = false,
  duration,
}: {
  reviews: typeof TESTIMONIALS;
  reverse?: boolean;
  duration: string;
}) {
  const strip = [...reviews, ...reviews];
  return (
    <div className="group flex overflow-hidden">
      <div
        aria-hidden="true"
        className={`animate-marquee flex w-max gap-4 pr-4 group-hover:[animation-play-state:paused] sm:gap-6 sm:pr-6 ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
        style={{ animationDuration: duration }}
      >
        {strip.map((review, i) => (
          <ReviewCard key={`${review.name}-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const secondRow = [...TESTIMONIALS].reverse();
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  // Pause the marquee animation entirely while the section is off-screen —
  // a set of infinite CSS animations ticking away below the fold wastes
  // main-thread/compositor work for no visible benefit.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className={`scroll-mt-24 overflow-hidden bg-ink-soft py-24 sm:py-32 ${
        offscreen ? "marquee-paused" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          index="06"
          label="Guest Book"
          title="What guests wrote after their stay."
        />

        <Reveal className="mb-12 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mb-16">
          <p className="flex items-baseline gap-3">
            <span className="font-numeric text-5xl text-cream sm:text-6xl">
              {GOOGLE_REVIEWS.rating}
            </span>
            <span className="text-celadon" aria-hidden>
              <Star className="h-6 w-6" />
            </span>
          </p>
          <div>
            <p className="text-sm text-cream">
              Average rating on Google
            </p>
            <p className="font-numeric mt-0.5 text-xs uppercase tracking-[0.2em] text-cream-dim">
              {GOOGLE_REVIEWS.count} reviews
            </p>
          </div>
          <a
            href={GOOGLE_REVIEWS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border keyline px-5 py-2.5 text-sm text-cream transition-colors hover:border-teal hover:text-celadon"
          >
            Read them all on Google
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Reveal>
      </div>

      {/* Screen-reader-only source of truth: every review announced exactly
          once. The marquees below are a decorative, aria-hidden repeat of
          this same content. */}
      <ul className="sr-only">
        {TESTIMONIALS.map((review) => (
          <li key={review.name}>
            <p>{review.name}</p>
            <p>{review.meta}</p>
            <p>Rated {review.rating} out of 5 stars</p>
            <p>&ldquo;{review.text}&rdquo;</p>
          </li>
        ))}
      </ul>

      {/* Full-bleed marquee rows, opposite directions, pause on hover or
          when the section scrolls out of view */}
      <Reveal delay={120} className="space-y-4 sm:space-y-6">
        <MarqueeRow reviews={TESTIMONIALS} duration="100s" />
        <MarqueeRow reviews={secondRow} reverse duration="120s" />
      </Reveal>
    </section>
  );
}
