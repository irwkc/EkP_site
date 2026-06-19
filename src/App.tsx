import { useState } from "react";
import { useLenis } from "./hooks/useLenis";
import { type SectionKey } from "./data/sections";
import gallery from "./data/gallery.json";
import Cursor from "./components/Cursor";
import PaintTrail from "./components/PaintTrail";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee, { PhotoStrip } from "./components/Marquee";
import Index from "./components/Index";
import Founder from "./components/Founder";
import Exhibition from "./components/Exhibition";
import Contact from "./components/Contact";
import Chapter from "./components/Chapter";

const STRIP = [
  ...gallery.zhivopis.slice(0, 4),
  ...gallery.kartiny.slice(0, 4),
  ...gallery.masterclass.slice(0, 4),
];

export default function App() {
  useLenis();
  const [chapter, setChapter] = useState<SectionKey | null>(null);

  return (
    <div id="top" className="grain relative">
      <Cursor />
      <Preloader />
      <Nav />

      <main className="relative">
        <PaintTrail />
        <Hero />
        <Marquee />
        <Index onOpen={setChapter} />
        <PhotoStrip images={STRIP} />
        <Founder />
        <Exhibition />
        <Contact />
      </main>

      <Chapter activeKey={chapter} onClose={() => setChapter(null)} />
    </div>
  );
}
