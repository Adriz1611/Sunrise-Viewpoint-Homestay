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

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border focus:border-teal focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Rooms />
        <Experiences />
        <Gallery />
        <Tariff />
        <Testimonials />
        <GettingHere />
      </main>
      <Footer />
      <CallPill />
    </>
  );
}
