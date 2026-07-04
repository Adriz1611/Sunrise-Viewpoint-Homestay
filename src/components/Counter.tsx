"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type CounterProps = {
  /** e.g. "8", "180°", "~10" — non-digit prefix/suffix are preserved */
  value: string;
  className?: string;
};

/**
 * Stat number that counts up from zero when scrolled into view.
 * Server-renders the final value, so no-JS and reduced-motion users
 * (and crawlers) always see the real number.
 */
export default function Counter({ value, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const match = value.match(/^(\D*?)(\d+)(.*)$/);
      if (!match) return;
      const [, prefix, digits, suffix] = match;
      const target = parseInt(digits, 10);

      const state = { n: 0 };
      el.textContent = `${prefix}0${suffix}`;
      gsap.to(state, {
        n: target,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate() {
          el.textContent = `${prefix}${Math.round(state.n)}${suffix}`;
        },
      });
    },
    { dependencies: [value] }
  );

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
