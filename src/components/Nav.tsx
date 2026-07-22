"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT, NAV_LINKS } from "@/lib/site";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // Move focus to the first link when the menu opens
  useEffect(() => {
    if (open) {
      overlayRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    }
  }, [open]);

  // Escape closes the menu and returns focus to the hamburger
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    hamburgerRef.current?.focus();
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        open
          ? "border-b keyline bg-ink"
          : scrolled
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
          Sunrise<span className="text-teal">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-4 lg:flex xl:gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="group whitespace-nowrap text-[11px] text-cream-dim transition-colors hover:text-cream xl:text-xs"
              >
                <span className="font-numeric mr-1.5 text-[0.65rem] text-teal">
                  ({link.index})
                </span>
                <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-teal after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href={CONTACT.phones[0].href}
          className="font-numeric hidden whitespace-nowrap rounded-full border keyline px-4 py-2 text-sm text-cream transition-[transform,color,border-color] duration-200 hover:border-teal hover:text-celadon active:scale-[0.97] lg:block"
        >
          {CONTACT.phones[0].number}
        </a>

        {/* Mobile menu button */}
        <button
          ref={hamburgerRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 lg:hidden"
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
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        inert={!open}
        className={`fixed inset-0 top-[69px] z-40 bg-ink transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex h-full flex-col justify-center gap-2 overflow-y-auto px-8 pb-24">
          {NAV_LINKS.map((link, i) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={closeMenu}
                className="group flex items-baseline gap-4 border-b keyline py-4"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span className="font-numeric text-xs text-teal">
                  ({link.index})
                </span>
                <span className="font-display text-3xl text-cream transition-colors group-hover:text-celadon">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
          <li className="mt-8">
            <a
              href={CONTACT.phones[0].href}
              onClick={closeMenu}
              className="font-numeric text-xl text-celadon"
            >
              {CONTACT.phones[0].number}
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
