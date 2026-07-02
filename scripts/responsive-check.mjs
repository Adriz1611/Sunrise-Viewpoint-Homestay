#!/usr/bin/env node
/**
 * Screenshots the site at a fixed set of breakpoints and reports layout
 * problems (horizontal overflow, wrapped nav links, footer text overlap)
 * as structured JSON. Requires `npm run dev` running on localhost:3000.
 *
 * Usage: node scripts/responsive-check.mjs [outDir]
 * Defaults outDir to ./responsive-check-output (gitignored).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] || "responsive-check-output");
mkdirSync(OUT, { recursive: true });

const BREAKPOINTS = [
  { name: "desktop-100", width: 1920, height: 1080 },
  { name: "desktop-125", width: 1536, height: 864 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 780 },
];

const SECTIONS = ["rooms", "experiences", "gallery", "tariff", "reviews", "getting-here"];

const browser = await chromium.launch();
const results = [];

for (const bp of BREAKPOINTS) {
  const page = await browser.newPage({ viewport: { width: bp.width, height: bp.height } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Force scroll-reveal elements visible so screenshots show final state,
  // not a mid-transition frame.
  await page.addStyleTag({
    content:
      "[data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }",
  });

  await page.screenshot({ path: path.join(OUT, `${bp.name}-top.png`) });

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const navUl = document.querySelector("header nav ul");
    const navLinkHeights = navUl
      ? [...navUl.querySelectorAll("a")].map((a) => Math.round(a.getBoundingClientRect().height))
      : [];
    const footer = document.querySelector("footer");
    const backdrop = footer.querySelector("p[aria-hidden]");
    const backdropRect = backdrop.getBoundingClientRect();
    const bottomRow = footer.querySelector("[class*='mt-16']");
    const bottomRowRect = bottomRow ? bottomRow.getBoundingClientRect() : null;
    return {
      hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
      navWrapped: navLinkHeights.length > 0 && Math.max(...navLinkHeights) > 25,
      footerOverlapsContent: bottomRowRect ? backdropRect.top < bottomRowRect.bottom : null,
    };
  });
  results.push({ breakpoint: bp.name, width: bp.width, ...metrics });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${bp.name}-footer.png`) });

  for (const id of SECTIONS) {
    await page.evaluate((sectionId) => {
      document.getElementById(sectionId)?.scrollIntoView({ block: "start" });
    }, id);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `${bp.name}-${id}.png`) });
  }

  if (bp.width < 1280) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const menuBtn = await page.$('header button[aria-label="Open menu"]');
    if (menuBtn) {
      await menuBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `${bp.name}-menu-open.png`) });
    }
  }

  await page.close();
}

writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));

const problems = results.filter(
  (r) => r.hasHorizontalOverflow || r.navWrapped || r.footerOverlapsContent
);
console.log(JSON.stringify(results, null, 2));
if (problems.length) {
  console.error(`\n${problems.length} breakpoint(s) with problems — see results.json`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${results.length} breakpoints clean. Screenshots in ${OUT}`);
}

await browser.close();
