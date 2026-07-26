"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { telHref } from "@/lib/phone";
import type { SiteSetting } from "@/payload-types";

type NavProps = {
  phones: NonNullable<SiteSetting["bookingPhones"]>;
};

export default function Nav({ phones }: NavProps) {
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
          href={telHref(phones![0].number)}
          className="font-numeric hidden whitespace-nowrap rounded-full border keyline px-4 py-2 text-sm text-cream transition-[transform,color,border-color] duration-200 hover:border-teal hover:text-celadon active:scale-[0.97] lg:block"
        >
          {phones![0].number}
        </a>

        <div className="flex items-center gap-1.5 lg:hidden">
          <a
            href={telHref(phones![0].number)}
            aria-label="Call Sunrise Viewpoint Homestay"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal px-4 text-sm font-medium text-ink transition-[transform,background-color] duration-200 hover:bg-celadon active:scale-[0.97]"
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

          {/* Mobile menu button */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5"
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
        </div>
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
              href={telHref(phones![0].number)}
              onClick={closeMenu}
              className="font-numeric text-xl text-celadon"
            >
              {phones![0].number}
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
