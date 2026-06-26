import { useLocation } from "react-router-dom";
import { useSiteContent } from "../context/ContentContext";
import { PhotoStrip } from "../components/Marquee";
import PaintTrail from "../components/PaintTrail";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Index from "../components/Index";
import Founder from "../components/Founder";
import Exhibition from "../components/Exhibition";
import CatalogTeaser from "../components/CatalogTeaser";
import Contact from "../components/Contact";

export default function Home() {
  const location = useLocation();
  const { photoStrip } = useSiteContent();

  return (
    <main id="top" className="relative overflow-x-clip overflow-y-clip">
      <PaintTrail />
      <Hero key={location.key} />
      <Marquee />
      <Index />
      <PhotoStrip images={photoStrip} />
      <Founder />
      <Exhibition />
      <CatalogTeaser />
      <Contact />
    </main>
  );
}
