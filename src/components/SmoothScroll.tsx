"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Lenis inertial smooth-scrolling, driven by GSAP's ticker so ScrollTrigger
 * animations stay perfectly in sync with the eased scroll position.
 *
 * `anchors: true` makes hash links glide instead of jump. Lenis already
 * honours each section's `scroll-mt-24` — don't add an offset on top of it
 * (that double-counts and overshoots the landing position).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.1,
      anchors: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
