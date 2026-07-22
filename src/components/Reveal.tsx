"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger delay in milliseconds */
  delay?: number;
  id?: string;
};

/**
 * Fades content up when it enters the viewport, via GSAP ScrollTrigger.
 * globals.css keeps [data-reveal] at opacity 0 before hydration so nothing
 * flashes; reduced-motion users get everything visible with no animation.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 1.15,
        ease: "power3.out",
        delay: delay / 1000,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  return (
    <Tag ref={ref} id={id} data-reveal className={className}>
      {children}
    </Tag>
  );
}
