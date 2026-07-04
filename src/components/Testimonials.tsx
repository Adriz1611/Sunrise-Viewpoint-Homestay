import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { GOOGLE_REVIEWS, TESTIMONIALS } from "@/lib/site";

function Stars({ rating }: { rating: number }) {
  return (
    <p
      className="font-numeric text-sm tracking-[0.25em] text-celadon"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {"★".repeat(rating)}
      <span className="text-ink-line">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

function ReviewCard({
  review,
}: {
  review: (typeof TESTIMONIALS)[number];
}) {
  return (
    <figure className="flex w-[19rem] shrink-0 flex-col justify-between gap-5 rounded-2xl border keyline bg-ink p-6 sm:w-[22rem] sm:p-7">
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
 * Renders `repeat` copies of `reviews` as one "unit", then two units back to
 * back. The marquee animates by exactly -50% (one unit-width), so it loops
 * seamlessly — but only if a single unit is wider than the viewport, or the
 * tail end of the loop shows blank space before the copy wraps back in.
 * With 16 real reviews, repeat=2 already gives a 32-card unit — comfortably
 * wider than any real monitor — without rendering excess duplicate DOM.
 */
function MarqueeRow({
  reviews,
  reverse = false,
  duration,
  repeat = 2,
}: {
  reviews: typeof TESTIMONIALS;
  reverse?: boolean;
  duration: string;
  repeat?: number;
}) {
  const unit = Array.from({ length: repeat }, () => reviews).flat();
  const strip = [...unit, ...unit];
  return (
    <div className="group flex overflow-hidden">
      <div
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

  return (
    <section id="reviews" className="scroll-mt-24 overflow-hidden bg-ink-soft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          index="06"
          label="Guest Book"
          title={
            <>
              Don&apos;t take our word for it —{" "}
              <em className="text-celadon">take theirs</em>.
            </>
          }
        />

        <Reveal className="mb-12 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mb-16">
          <p className="flex items-baseline gap-3">
            <span className="font-numeric text-5xl text-cream sm:text-6xl">
              {GOOGLE_REVIEWS.rating}
            </span>
            <span className="text-2xl text-celadon" aria-hidden>
              ★
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
            className="rounded-full border keyline px-5 py-2.5 text-sm text-cream transition-colors hover:border-teal hover:text-celadon"
          >
            Read them all on Google ↗
          </a>
        </Reveal>
      </div>

      {/* Full-bleed marquee rows, opposite directions, pause on hover */}
      <Reveal delay={120} className="space-y-4 sm:space-y-6">
        <MarqueeRow reviews={TESTIMONIALS} duration="200s" />
        <MarqueeRow reviews={secondRow} reverse duration="240s" />
      </Reveal>
    </section>
  );
}
