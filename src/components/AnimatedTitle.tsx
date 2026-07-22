"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

type AnimatedTitleProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * Headline that reveals line by line — each line rises out of an overflow
 * mask when scrolled into view. autoSplit waits for fonts and re-splits on
 * resize; the split is reverted once the animation finishes so the final DOM
 * is the original untouched markup (keeps selection/find-in-page intact and
 * avoids the masks permanently clipping descenders at tight line-heights).
 */
export default function AnimatedTitle({
  children,
  as: Tag = "h2",
  className,
}: AnimatedTitleProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.3,
            stagger: 0.09,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onComplete: () => self.revert(),
          });
        },
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
