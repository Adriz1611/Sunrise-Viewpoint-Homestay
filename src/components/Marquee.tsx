"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = [
  "180° sunrise over Kanchenjunga",
  "Home-cooked in our tea garden",
  "Orange orchards of Sittong",
  "Hornbills of Latpanchar",
  "Teesta river far below",
  "Nights built for stargazing",
];

// A single copy of ITEMS measures ~2049px wide at this type size — narrower
// than a 2560px+ viewport, which left a visible blank gap at the loop
// boundary (translateX(-50%)) on wide monitors. Doubling ITEMS per unit
// (~4098px) clears that with margin; duration is doubled from the base 32s
// to keep the same px/s scroll speed.
const UNIT = [...ITEMS, ...ITEMS];

export default function Marquee() {
  const strip = [...UNIT, ...UNIT];
  const rootRef = useRef<HTMLDivElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  // Pause the ticker's infinite CSS animation while it's scrolled out of
  // view — same rationale as the testimonials marquees.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`overflow-hidden border-y keyline bg-ink-soft py-4 ${
        offscreen ? "marquee-paused" : ""
      }`}
    >
      <div
        className="animate-marquee flex w-max items-center gap-8"
        style={{ animationDuration: "64s" }}
      >
        {strip.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 whitespace-nowrap font-display text-lg text-cream-dim sm:text-xl"
          >
            {item}
            <span
              aria-hidden
              className="mx-2 inline-block h-1.5 w-1.5 rotate-45 bg-teal"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
