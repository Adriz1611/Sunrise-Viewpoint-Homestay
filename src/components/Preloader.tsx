"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { markRevealed } from "@/lib/reveal";

/**
 * Opening sequence: a small centred frame flicks through glimpses of the
 * place (sequential wipe reveals with a slow zoom inside each), a counter
 * runs 0→100, then the final frame — the hero's own Kanchenjunga photo —
 * expands to fill the screen and the overlay lifts, handing off seamlessly
 * to the hero intro (which waits for markRevealed()).
 *
 * Reduced-motion users never see it: the root is `motion-reduce:hidden`
 * and the effect exits immediately.
 */
const FRAMES = [
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop",
    alt: "",
  },
  { src: "/images/hero-kanchenjunga.jpg", alt: "" },
];

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const finish = () => {
        document.documentElement.classList.remove("preloading");
        markRevealed();
        setDone(true);
      };

      if (prefersReducedMotion()) {
        finish();
        return;
      }

      document.documentElement.classList.add("preloading");

      const el = root.current;
      if (!el) {
        finish();
        return;
      }

      // Safety net: rAF (and therefore GSAP) doesn't tick in hidden tabs.
      // If the site is opened in a background tab, don't leave the visitor
      // stuck behind a frozen overlay with scroll locked — timers still run
      // (throttled) when hidden, so this guarantees an exit. markRevealed()
      // and the class removal are both idempotent.
      const failsafe = window.setTimeout(() => {
        gsap.to(el, { autoAlpha: 0, duration: 0.5, onComplete: finish });
      }, 9000);

      const frame = el.querySelector(".pre-frame") as HTMLElement;
      const shots = gsap.utils.toArray<HTMLElement>(".pre-shot", el);
      const count = { n: 0 };
      const counterEl = el.querySelector(".pre-count") as HTMLElement;

      const coverScale = () =>
        Math.max(
          window.innerWidth / frame.offsetWidth,
          window.innerHeight / frame.offsetHeight
        ) * 1.02;

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
      });

      // All shots start hidden below their wipe except the first.
      gsap.set(shots.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(
        shots.map((s) => s.querySelector("img")),
        { scale: 1.25 }
      );

      tl.from(frame, { scale: 0.85, autoAlpha: 0, duration: 0.7, ease: "power3.out" })
        .from(
          ".pre-meta",
          { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" },
          "<0.1"
        );

      // Sequential wipes, each shot's image easing its zoom the whole time.
      shots.forEach((shot, i) => {
        const img = shot.querySelector("img");
        if (i > 0) {
          tl.to(shot, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55 }, `shot${i}`);
        }
        tl.to(
          img,
          { scale: 1.05, duration: 1.05, ease: "power2.out" },
          i === 0 ? "<-0.4" : `shot${i}`
        );
        if (i < shots.length - 1) {
          tl.addLabel(`shot${i + 1}`, "<0.55");
        }
      });

      // Counter runs across the whole flick-through.
      tl.to(
        count,
        {
          n: 100,
          duration: tl.duration() - 0.7,
          ease: "power1.inOut",
          onUpdate() {
            counterEl.textContent = String(Math.round(count.n)).padStart(3, "0");
          },
        },
        0.7
      );

      // The last frame (the real hero photo) expands to cover the screen
      // while the hero's own gradient tint + grain fade in over it — so the
      // fully expanded frame IS the landing page, pixel for pixel, and the
      // overlay can lift without any visible change of image.
      tl.to(".pre-meta", { autoAlpha: 0, duration: 0.4, ease: "power2.out" })
        .to(frame, { scale: coverScale, duration: 1.1, ease: "power4.inOut" }, "<")
        .to(".pre-tint", { autoAlpha: 1, duration: 1.1, ease: "power2.inOut" }, "<")
        .call(() => {
          window.clearTimeout(failsafe);
          finish();
        })
        .to(el, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" });
    },
    { scope: root }
  );

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden
      data-preloader
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink motion-reduce:hidden"
    >
      <div className="pre-frame relative aspect-[4/3] w-[72vw] max-w-md overflow-hidden">
        {FRAMES.map((shot, i) => (
          <div key={shot.src} className="pre-shot absolute inset-0 overflow-hidden" style={{ zIndex: i }}>
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              priority
              sizes="(min-width: 640px) 28rem, 72vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* The Hero's exact grade (gradient + grain), faded in during the
            final expansion so the handoff is invisible. Keep in sync with
            the overlay in Hero.tsx. */}
        <div
          aria-hidden
          className="pre-tint grain absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink opacity-0"
          style={{ zIndex: FRAMES.length }}
        />
      </div>

      <p className="pre-meta absolute bottom-6 left-5 text-[0.65rem] uppercase tracking-[0.3em] text-cream-dim sm:bottom-8 sm:left-8">
        Sunrise Viewpoint — Aahaldara
      </p>
      <p className="pre-meta absolute bottom-6 right-5 sm:bottom-8 sm:right-8">
        <span className="pre-count font-numeric text-sm text-cream">000</span>
      </p>
    </div>
  );
}
