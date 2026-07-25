import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * True inside Payload's Live Preview iframe. Live Preview re-renders on every
 * keystroke, which re-splits the hero headline and rebuilds ScrollTriggers
 * mid-animation — leaving text half-masked or invisible while the client
 * types. Taking the reduced-motion path there shows stable, fully visible
 * content. The published site is unaffected.
 *
 * Detected synchronously from the frame + query string so it needs no
 * provider and no effect-ordering guarantees.
 */
function isLivePreview() {
  return (
    window.self !== window.top &&
    new URLSearchParams(window.location.search).has("preview")
  );
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
