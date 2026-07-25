import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { isLivePreview } from "@/lib/preview";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * Every animation entry point checks this and bails, leaving content fully
 * visible and static — GSAP effects are progressive enhancement only.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  if (isLivePreview()) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText };
