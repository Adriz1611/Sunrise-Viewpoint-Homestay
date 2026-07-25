import { draftMode } from "next/headers";
import About from "@/components/About";
import CallPill from "@/components/CallPill";
import Experiences from "@/components/Experiences";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import GettingHere from "@/components/GettingHere";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Rooms from "@/components/Rooms";
import SmoothScroll from "@/components/SmoothScroll";
import Tariff from "@/components/Tariff";
import Testimonials from "@/components/Testimonials";
import { getHero, getRooms, getSiteSettings } from "@/lib/content";

export default async function Home() {
  const { isEnabled: draft } = await draftMode();
  const [settings, hero, rooms] = await Promise.all([
    getSiteSettings(draft),
    getHero(draft),
    getRooms(draft),
  ]);

  return (
    <>
      <SmoothScroll />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border focus:border-teal focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <Nav phones={settings.bookingPhones} />
      <main id="main">
        <Hero data={hero} meta={settings} />
        <Marquee />
        <About />
        <Rooms data={rooms} />
        <Experiences />
        <Gallery />
        <Tariff phones={settings.bookingPhones} />
        <Testimonials />
        <GettingHere
          transport={{
            name: settings.transportName,
            phones: settings.transportPhones ?? [],
          }}
        />
      </main>
      <Footer settings={settings} />
      <CallPill phone={settings.bookingPhones![0]} />
    </>
  );
}
