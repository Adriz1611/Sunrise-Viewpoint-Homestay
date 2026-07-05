"use client";

import { useEffect, useState } from "react";
import { CONTACT } from "@/lib/site";

/**
 * Mobile-only sticky call button — the site's sole conversion path should
 * stay reachable with a thumb once the hero (and its own "Call to book" CTA)
 * has scrolled out of view. Hidden at/above the hero via IntersectionObserver
 * on #top, and hidden entirely on lg+ where the Nav phone pill is visible.
 */
export default function CallPill() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={CONTACT.phones[0].href}
      aria-label="Call Sunrise Viewpoint Homestay"
      className={`fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex min-h-[44px] items-center gap-2 rounded-full bg-teal px-5 py-3 font-medium text-ink transition-[transform,opacity] duration-300 active:scale-[0.97] lg:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.02L6.6 10.8Z" />
      </svg>
      Call
    </a>
  );
}
