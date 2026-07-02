"use client";

import { useEffect, useState } from "react";
import { CONTACT, NAV_LINKS } from "@/lib/site";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled && !open
          ? "border-b keyline bg-ink/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a
          href="#top"
          className="font-display text-lg tracking-tight text-cream"
          onClick={() => setOpen(false)}
        >
          Sunrise<span className="text-ember">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="group text-sm text-cream-dim transition-colors hover:text-cream"
              >
                <span className="font-numeric mr-1.5 text-[0.65rem] text-ember">
                  {link.index}
                </span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={CONTACT.phones[0].href}
          className="font-numeric hidden rounded-full border keyline px-4 py-2 text-sm text-cream transition-colors hover:border-ember hover:text-amber lg:block"
        >
          {CONTACT.phones[0].number}
        </a>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-px w-6 bg-cream transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-cream transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 top-[69px] z-40 bg-ink transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex h-full flex-col justify-center gap-2 px-8 pb-24">
          {NAV_LINKS.map((link, i) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-4 border-b keyline py-4"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span className="font-numeric text-xs text-ember">
                  ({link.index})
                </span>
                <span className="font-display text-3xl text-cream transition-colors group-hover:text-amber">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
          <li className="mt-8">
            <a
              href={CONTACT.phones[0].href}
              className="font-numeric text-xl text-amber"
            >
              {CONTACT.phones[0].number}
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
