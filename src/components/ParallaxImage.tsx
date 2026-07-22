"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type ParallaxImageProps = {
  src: string;
  alt: string;
  sizes: string;
  /** Wrapper classes — aspect ratio, rounding, sizing */
  className?: string;
  /**
   * Parallax amplitude: the image drifts from -speed% to +speed% of its own
   * height as the element crosses the viewport. The image is over-scaled
   * just enough that the drift never exposes its edges.
   */
  speed?: number;
  /** Cinematic entrance: wipe up from the bottom while the image settles. */
  reveal?: boolean;
  priority?: boolean;
};

/**
 * Image with scroll-scrubbed parallax and an optional wipe-in entrance.
 * The wrapper keeps overflow-hidden + border-radius so the animated
 * clip-path inside never breaks rounded corners.
 */
export default function ParallaxImage({
  src,
  alt,
  sizes,
  className = "",
  speed = 8,
  reveal = true,
  priority,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const frame = el.firstElementChild as HTMLElement | null;
      const img = el.querySelector("img");
      if (!frame || !img) return;
      if (prefersReducedMotion()) return;

      // Over-scale to cover the parallax travel without exposing edges.
      const cover = 1 + speed / 40;

      if (reveal) {
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          })
          .fromTo(
            frame,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.4,
              ease: "power4.inOut",
            }
          )
          .fromTo(
            img,
            { scale: cover * 1.22 },
            { scale: cover, duration: 2, ease: "power3.out" },
            0.15
          );
      } else {
        gsap.set(img, { scale: cover });
      }

      gsap.fromTo(
        img,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: ref, dependencies: [speed, reveal] }
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    </div>
  );
}
