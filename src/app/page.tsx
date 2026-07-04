import About from "@/components/About";
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
      <Nav />
      <main>
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
    </>
  );
}
