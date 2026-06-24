import gallery from "../data/gallery.json";
import PaintTrail from "../components/PaintTrail";
import Hero from "../components/Hero";
import Marquee, { PhotoStrip } from "../components/Marquee";
import Index from "../components/Index";
import Founder from "../components/Founder";
import Exhibition from "../components/Exhibition";
import Contact from "../components/Contact";

const STRIP = [
  ...gallery.zhivopis.slice(0, 4),
  ...gallery.kartiny.slice(0, 4),
  ...gallery.masterclass.slice(0, 4),
];

export default function Home() {
  return (
    <main id="top" className="relative">
      <PaintTrail />
      <Hero />
      <Marquee />
      <Index />
      <PhotoStrip images={STRIP} />
      <Founder />
      <Exhibition />
      <Contact />
    </main>
  );
}
